# Comprueba fichas de la biblioteca de Otero.
# Uso:  ruby -Eutf-8:utf-8 tools/validar.rb content/species/arb.js [--gbif] [--solo-nuevas id1,id2]
#   Sin --gbif: comprueba formato, ids únicos, grupos, zonas y rasgos.
#   Con --gbif: además consulta GBIF (nombre científico aceptado y registros en España en cada zona de «r»).
# Funciona sin node: convierte el literal JS a JSON.
require 'json'
require 'net/http'
require 'uri'

ROOT = File.expand_path('..', __dir__)

# --- literal JS (objetos/arrays con claves sin comillas, comillas simples, comas finales, comentarios) → Ruby
def js_to_json(src)
  out = +''
  i = 0
  n = src.length
  while i < n
    c = src[i]
    if c == '/' && src[i + 1] == '/'
      i += 1 while i < n && src[i] != "\n"
    elsif c == '/' && src[i + 1] == '*'
      i = src.index('*/', i + 2) + 2
    elsif c == "'" || c == '"' || c == '`'
      q = c; i += 1; s = +''
      while i < n && src[i] != q
        if src[i] == '\\'
          nx = src[i + 1]
          s << (nx == 'n' ? "\n" : nx); i += 2
        else
          s << src[i]; i += 1
        end
      end
      i += 1
      out << s.to_json
    elsif c =~ /[\p{L}_$]/
      j = i; j += 1 while j < n && src[j] =~ /[\p{L}\p{N}_$]/
      word = src[i...j]
      k = j; k += 1 while k < n && src[k] =~ /\s/
      if src[k] == ':' && !%w[true false null].include?(word)
        out << word.to_json
      else
        out << word
      end
      i = j
    else
      out << c; i += 1
    end
  end
  out.gsub(/,(\s*[\]}])/, '\1')
end

def load_array(path)
  src = File.read(path, encoding: 'utf-8')
  body = src[/export default\s*(\[.*\])\s*;?\s*\z/m, 1] or raise "#{path}: no encuentro «export default [ … ];»"
  JSON.parse(js_to_json(body))
end

def load_const(path, name)
  src = File.read(path, encoding: 'utf-8')
  start = src.index("export const #{name} = ") or raise "sin #{name}"
  i = src.index(/[\[{]/, start); depth = 0; j = i
  loop do
    ch = src[j]
    if ch == "'" || ch == '"' || ch == '`'
      q = ch; j += 1; j += (src[j] == '\\' ? 2 : 1) while src[j] != q; j += 1; next
    end
    depth += 1 if ch == '{' || ch == '['
    depth -= 1 if ch == '}' || ch == ']'
    j += 1
    break if depth.zero?
  end
  JSON.parse(js_to_json(src[i...j]))
end

# Vocabulario (content/traits.js): las constantes COLOR/PATRON/ACT se resuelven antes de convertir
def load_traits
  src = File.read(File.join(ROOT, 'content/traits.js'), encoding: 'utf-8')
  consts = {}
  %w[COLOR PATRON ACT].each { |k| consts[k] = src[/const #{k} = (\{[^\n]*\});/, 1] }
  consts.each { |k, v| src = src.gsub(/opts: #{k}\b/, "opts: #{v}") }
  tmp = File.join(Dir.tmpdir, 'otero_traits.js') rescue '/tmp/otero_traits.js'
  File.write(tmp, src)
  { zonas: load_const(tmp, 'ZONAS'), subs: load_const(tmp, 'SUBS'), hab: load_const(tmp, 'HABITATS'), traits: load_const(tmp, 'TRAITS') }
end
require 'tmpdir'

# Cajas aproximadas de cada zona (para contar registros de GBIF en España)
ZONE_BOX = {
  'pirineo' => [41.9, 43.4, -2.0, 3.4], 'cantabrica' => [42.6, 43.6, -7.2, -3.0], 'galaico' => [41.8, 43.0, -7.6, -6.3],
  'vasco' => [42.6, 43.5, -3.4, -1.4], 'iberico' => [39.5, 42.4, -3.6, 0.6], 'central' => [40.0, 41.4, -7.0, -2.8],
  'toledo' => [39.1, 40.0, -6.0, -3.5], 'morena' => [37.5, 38.8, -7.5, -2.5], 'betica' => [36.2, 38.4, -6.0, -1.7],
  'catalanides' => [40.6, 42.4, 0.3, 3.3], 'baleares' => [38.6, 40.1, 1.1, 4.4], 'canarias' => [27.6, 29.5, -18.2, -13.3],
}

def http_json(url)
  tries = 0
  begin
    uri = URI(url)
    res = Net::HTTP.start(uri.host, uri.port, use_ssl: true, open_timeout: 15, read_timeout: 30) { |h| h.get(uri.request_uri, 'User-Agent' => 'Otero-validador/1.0') }
    raise "HTTP #{res.code}" unless res.code == '200'
    JSON.parse(res.body)
  rescue => e
    tries += 1
    sleep 2 * tries
    retry if tries < 3
    { 'error' => e.message }
  end
end

def gbif_check(s)
  probs = []
  kingdom = %w[arb pla].include?(s['g']) ? 'Plantae' : s['g'] == 'hon' ? 'Fungi' : 'Animalia' # evita homónimos entre reinos
  m = http_json("https://api.gbif.org/v1/species/match?name=#{URI.encode_www_form_component(s['sci'])}&kingdom=#{kingdom}")
  if m['error'] then return ["GBIF no respondió (#{m['error']})"] end
  if m['matchType'] == 'NONE' || !m['usageKey']
    return ["nombre científico «#{s['sci']}» no encontrado en GBIF"]
  end
  if m['matchType'] != 'EXACT'
    return ["GBIF solo da una coincidencia aproximada (#{m['matchType']}: #{m['scientificName']}): revisa el nombre"]
  end
  if m['status'] != 'ACCEPTED'
    acc = m['acceptedUsageKey'] ? http_json("https://api.gbif.org/v1/species/#{m['acceptedUsageKey']}")['canonicalName'] : '?'
    probs << "«#{s['sci']}» es #{m['status']} en GBIF (nombre aceptado: #{acc}). Aceptable si es el nombre usado en España; si no, corrígelo."
  end
  key = m['acceptedUsageKey'] || m['usageKey']
  total = http_json("https://api.gbif.org/v1/occurrence/search?taxonKey=#{key}&country=ES&limit=0")['count'].to_i
  probs << "sin registros en España en GBIF" if total.zero? && !(s['r'] || []).empty?
  (s['r'] || []).each do |z|
    b = ZONE_BOX[z] or next
    c = http_json("https://api.gbif.org/v1/occurrence/search?taxonKey=#{key}&country=ES&decimalLatitude=#{b[0]},#{b[1]}&decimalLongitude=#{b[2]},#{b[3]}&limit=0")['count'].to_i
    probs << "zona «#{z}»: 0 registros en GBIF (¿de verdad vive ahí?)" if c.zero?
    probs << "zona «#{z}»: solo #{c} registro(s) en GBIF (revisa)" if c.between?(1, 2)
  end
  probs
end

opt_vals = (i = ARGV.index('--solo-nuevas')) ? [ARGV[i + 1]] : []
files = ARGV.reject { |a| a.start_with?('--') || opt_vals.include?(a) }
gbif = ARGV.include?('--gbif')
only = (ARGV[ARGV.index('--solo-nuevas') + 1].split(',') rescue nil)
voc = load_traits
all_ids = Hash.new { |h, k| h[k] = [] }
Dir[File.join(ROOT, 'content/species/*.js')].each { |f| load_array(f).each { |s| all_ids[s['id']] << File.basename(f) } rescue nil }
errors = 0
files.each do |f|
  arr = load_array(f)
  grp = File.basename(f, '.js')
  puts "== #{f}: #{arr.size} fichas"
  arr.each do |s|
    p = []
    %w[id g n sci r alt hab idf].each { |k| p << "falta «#{k}»" if s[k].nil? || s[k] == '' }
    p << "id repetido en #{all_ids[s['id']].join(', ')}" if all_ids[s['id']].size > 1
    p << "id con formato raro (usa minúsculas, sin tildes, guiones)" unless s['id'].to_s =~ /\A[a-z0-9-]+\z/
    p << "g «#{s['g']}» no es «#{grp}»" if s['g'] != grp && grp != 'rocks'
    tg = s['g']
    p << "sub «#{s['sub']}» no está en SUBS.#{tg}" if s['sub'] && !(voc[:subs][tg] || {}).key?(s['sub'])
    p << "falta «sub»" unless s['sub']
    (s['r'] || []).each { |z| p << "zona «#{z}» no existe en ZONAS" unless voc[:zonas].key?(z) }
    p << "alt debe ser [mín, máx]" unless s['alt'].is_a?(Array) && s['alt'].size == 2 && s['alt'][0] <= s['alt'][1]
    (s['mes'] || []).each { |m| p << "mes #{m} fuera de 1-12" unless (1..12).cover?(m) }
    t = s['t'] || {}
    p << "sin rasgos «t»" if t.empty?
    t.each do |k, vals|
      vals = [vals] unless vals.is_a?(Array)
      if k == 'hab'
        vals.each { |v| p << "hábitat «#{v}» no está en HABITATS" unless voc[:hab].key?(v) }
      elsif (voc[:traits][tg] || {})[k]
        vals.each { |v| p << "rasgo #{k}: «#{v}» no está en TRAITS.#{tg}.#{k}" unless voc[:traits][tg][k]['opts'].key?(v) }
      else
        p << "rasgo «#{k}» no existe para el grupo #{tg}"
      end
    end
    if s['tox'] && !%w[mortal toxica comestible-precaucion no-comestible].include?(s['tox']) then p << "tox «#{s['tox']}» no válido" end
    if gbif && (only.nil? || only.include?(s['id']))
      p.concat(gbif_check(s)); sleep 0.2
    end
    next if p.empty?
    errors += 1
    puts "  #{s['id']} (#{s['sci']}):"
    p.each { |x| puts "    - #{x}" }
  end
end
puts errors.zero? ? 'OK: sin problemas' : "#{errors} ficha(s) con avisos"
