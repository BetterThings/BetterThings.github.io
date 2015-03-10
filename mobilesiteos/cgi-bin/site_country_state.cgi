#!/usr/bin/perl
use utf8;
use Encode 'decode_utf8';
use warnings;
#
# Copyright Notice:
my $script_name = 'Site-Country-State';
my $script_vers = '14.4.16';
my $script_date = 'Apr. 16, 2014';
my $script_year = '2013';

#  Copyright© - OpenSiteMobile
my $copyright_year = '2011-2014';

#  All rights reserved
#
# Description:
#
# Site-Country-State is a simple perl script used to produce JSON files on the web server.
# Site-Country-State is used in conjunction with our 'html5_country_state.html' page to add/edit
# JSON 'state by country' files. These files typically reside in the 'msos/states' folder
# of MobileSiteOS™, and are used to apply language specific 'state by country'
# output for our 'msos.countrystate' javascript module.
#
# Special Note:
#
# DO NOT leave this script active on the web server after you are done using it. It provides
# no security measures against others using it to make changes to your work. Remove, disable
# or password protect this script in some way when you are done with it.
#
# Contact Information:
#
# Author: Dwight Vietzke Jr.
# Email:  dwight_vietzke@yahoo.com
#


# ==========================================================================
#     Beginning of script...
# ==========================================================================

use CGI::Carp qw(fatalsToBrowser set_message);
use CGI qw(:cgi);
use lib ('./lib');
use JSON;
use MSOS::Base;
use strict;

$CGI::POST_MAX=1024 * 25;	# max 25K posts
$CGI::DISABLE_UPLOADS = 1;	# no uploads
$CGI::HEADERS_ONCE = 1;		# one set of HTTP headers please

BEGIN { set_message(\&MSOS::Base::handle_errors); }

my %def = ();
my $q = new CGI;

for my $p ($q->param) {
	my @v = map {Encode::decode('utf8',$_)} $q->param($p);
	$q->param($p,@v);
}

# Google available languages for translation (8/19/2010)
my %languages = (
  'AFRIKAANS' => 'af',
  'ALBANIAN' => 'sq',
  'AMHARIC' => 'am',
  'ARABIC' => 'ar',
  'ARMENIAN' => 'hy',
  'AZERBAIJANI' => 'az',
  'BASQUE' => 'eu',
  'BELARUSIAN' => 'be',
  'BENGALI' => 'bn',
  'BIHARI' => 'bh',
  'BRETON' => 'br',
  'BULGARIAN' => 'bg',
  'BURMESE' => 'my',
  'CATALAN' => 'ca',
  'CHEROKEE' => 'chr',
  'CHINESE' => 'zh',
  'CHINESE_SIMPLIFIED' => 'zh-CN',
  'CHINESE_TRADITIONAL' => 'zh-TW',
  'CORSICAN' => 'co',
  'CROATIAN' => 'hr',
  'CZECH' => 'cs',
  'DANISH' => 'da',
  'DHIVEHI' => 'dv',
  'DUTCH'=> 'nl',  
  'ENGLISH' => 'en',
  'ESPERANTO' => 'eo',
  'ESTONIAN' => 'et',
  'FAROESE' => 'fo',
  'FILIPINO' => 'tl',
  'FINNISH' => 'fi',
  'FRENCH' => 'fr',
  'FRISIAN' => 'fy',
  'GALICIAN' => 'gl',
  'GEORGIAN' => 'ka',
  'GERMAN' => 'de',
  'GREEK' => 'el',
  'GUJARATI' => 'gu',
  'HAITIAN_CREOLE' => 'ht',
  'HEBREW' => 'iw',
  'HINDI' => 'hi',
  'HUNGARIAN' => 'hu',
  'ICELANDIC' => 'is',
  'INDONESIAN' => 'id',
  'INUKTITUT' => 'iu',
  'IRISH' => 'ga',
  'ITALIAN' => 'it',
  'JAPANESE' => 'ja',
  'JAVANESE' => 'jw',
  'KANNADA' => 'kn',
  'KAZAKH' => 'kk',
  'KHMER' => 'km',
  'KOREAN' => 'ko',
  'KURDISH'=> 'ku',
  'KYRGYZ'=> 'ky',
  'LAO' => 'lo',
  'LATIN' => 'la',
  'LATVIAN' => 'lv',
  'LITHUANIAN' => 'lt',
  'LUXEMBOURGISH' => 'lb',
  'MACEDONIAN' => 'mk',
  'MALAY' => 'ms',
  'MALAYALAM' => 'ml',
  'MALTESE' => 'mt',
  'MAORI' => 'mi',
  'MARATHI' => 'mr',
  'MONGOLIAN' => 'mn',
  'NEPALI' => 'ne',
  'NORWEGIAN' => 'no',
  'OCCITAN' => 'oc',
  'ORIYA' => 'or',
  'PASHTO' => 'ps',
  'PERSIAN' => 'fa',
  'POLISH' => 'pl',
  'PORTUGUESE' => 'pt',
  'PORTUGUESE_PORTUGAL' => 'pt-PT',
  'PUNJABI' => 'pa',
  'QUECHUA' => 'qu',
  'ROMANIAN' => 'ro',
  'RUSSIAN' => 'ru',
  'SANSKRIT' => 'sa',
  'SCOTS_GAELIC' => 'gd',
  'SERBIAN' => 'sr',
  'SINDHI' => 'sd',
  'SINHALESE' => 'si',
  'SLOVAK' => 'sk',
  'SLOVENIAN' => 'sl',
  'SPANISH' => 'es',
  'SUNDANESE' => 'su',
  'SWAHILI' => 'sw',
  'SWEDISH' => 'sv',
  'SYRIAC' => 'syr',
  'TAJIK' => 'tg',
  'TAMIL' => 'ta',
  'TATAR' => 'tt',
  'TELUGU' => 'te',
  'THAI' => 'th',
  'TIBETAN' => 'bo',
  'TONGA' => 'to',
  'TURKISH' => 'tr',
  'UKRAINIAN' => 'uk',
  'URDU' => 'ur',
  'UZBEK' => 'uz',
  'UIGHUR' => 'ug',
  'VIETNAMESE' => 'vi',
  'WELSH' => 'cy',
  'YIDDISH' => 'yi',
  'YORUBA' => 'yo',
  'UNKNOWN' => ''
);

# Bundle language code part
my @avail_langs = ();
foreach (keys %languages) { push(@avail_langs, $languages{$_}); }

# All available states by country info (use to rebuild corrupted msos/states json files or to revise after many changes in one shot)
my %state_by_country = (
"AF" => ["Badakhshan", "Badghis", "Baghlan", "Balkh", "Bamian", "Farah", "Faryab", "Ghazni", "Ghowr", "Helmand", "Herat", "Jowzjan", "Kabol", "Kandahar", "Kapisa", "Konar", "Kondoz", "Laghman", "Lowgar", "Nangarhar", "Nimruz", "Oruzgan", "Paktia", "Paktika", "Parvan", "Samangan", "Sar-e Pol", "Takhar", "Vardak", "Zabol"],
"AX" => ["Aland Islands"],
"AL" => ["Berat", "Bulqize", "Delvine", "Devoll (Bilisht)", "Diber (Peshkopi)", "Durres", "Elbasan", "Fier", "Gjirokaster", "Gramsh", "Has (Krume)", "Kavaje", "Kolonje (Erseke)", "Korce", "Kruje", "Kucove", "Kukes", "Kurbin", "Lezhe", "Librazhd", "Lushnje", "Malesi e Madhe (Koplik)", "Mallakaster (Ballsh)", "Mat (Burrel)", "Mirdite (Rreshen)", "Peqin", "Permet", "Pogradec", "Puke", "Sarande", "Shkoder", "Skrapar (Corovode)", "Tepelene", "Tirane (Tirana)", "Tirane (Tirana)", "Tropoje (Bajram Curri)", "Vlore"],
"DZ" => ["Adrar", "Ain Defla", "Ain Temouchent", "Alger", "Annaba", "Batna", "Bechar", "Bejaia", "Biskra", "Blida", "Bordj Bou Arreridj", "Bouira", "Boumerdes", "Chlef", "Constantine", "Djelfa", "El Bayadh", "El Oued", "El Tarf", "Ghardaia", "Guelma", "Illizi", "Jijel", "Khenchela", "Laghouat", "M'Sila", "Mascara", "Medea", "Mila", "Mostaganem", "Naama", "Oran", "Ouargla", "Oum el Bouaghi", "Relizane", "Saida", "Setif", "Sidi Bel Abbes", "Skikda", "Souk Ahras", "Tamanghasset", "Tebessa", "Tiaret", "Tindouf", "Tipaza", "Tissemsilt", "Tizi Ouzou", "Tlemcen"],
"AS" => ["Eastern", "Manu'a", "Rose Island", "Swains Island", "Western"],
"AD" => ["Andorra"],
"AO" => ["Andorra la Vella", "Bengo", "Benguela", "Bie", "Cabinda", "Canillo", "Cuando Cubango", "Cuanza Norte", "Cuanza Sul", "Cunene", "Encamp", "Escaldes-Engordany", "Huambo", "Huila", "La Massana", "Luanda", "Lunda Norte", "Lunda Sul", "Malanje", "Moxico", "Namibe", "Ordino", "Sant Julia de Loria", "Uige", "Zaire"],
"AI" => ["Anguilla"],
"AQ" => ["Antartica"],
"AG" => ["Barbuda", "Redonda", "Saint George", "Saint John", "Saint Mary", "Saint Paul", "Saint Peter", "Saint Philip"],
"AR" => ["Antartica e Islas del Atlantico Sur", "Buenos Aires", "Buenos Aires Capital Federal", "Catamarca", "Chaco", "Chubut", "Cordoba", "Corrientes", "Entre Rios", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquen", "Rio Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucuman"],
"AM" => ["Aragatsotn", "Ararat", "Armavir", "Geghark'unik'", "Kotayk'", "Lorri", "Shirak", "Syunik'", "Tavush", "Vayots' Dzor", "Yerevan"],
"AW" => ["Aruba"],
"AU" => [["AAT", "Australian Antarctic Territory"], ["ACT", "Australian Capital Territory"], ["NSW", "New South Wales"], ["NT", "Northern Territory"], ["QLD", "Queensland"], ["SA", "South Australia"], ["TAS", "Tasmania"], ["VIC", "Victoria"], ["WA", "Western Australia"]],
"AT" => ["Burgenland", "Kaernten", "Niederoesterreich", "Oberoesterreich", "Salzburg", "Steiermark", "Tirol", "Vorarlberg", "Wien"],
"AZ" => ["Abseron Rayonu", "Agcabadi Rayonu", "Agdam Rayonu", "Agdas Rayonu", "Agstafa Rayonu", "Agsu Rayonu", "Ali Bayramli Sahari", "Astara Rayonu", "Baki Sahari", "Balakan Rayonu", "Barda Rayonu", "Beylaqan Rayonu", "Bilasuvar Rayonu", "Cabrayil Rayonu", "Calilabad Rayonu", "Daskasan Rayonu", "Davaci Rayonu", "Fuzuli Rayonu", "Gadabay Rayonu", "Ganca Sahari", "Goranboy Rayonu", "Goycay Rayonu", "Haciqabul Rayonu", "Imisli Rayonu", "Ismayilli Rayonu", "Kalbacar Rayonu", "Kurdamir Rayonu", "Lacin Rayonu", "Lankaran Rayonu", "Lankaran Sahari", "Lerik Rayonu", "Masalli Rayonu", "Mingacevir Sahari", "Naftalan Sahari", "Naxcivan Muxtar Respublikasi", "Neftcala Rayonu", "Oguz Rayonu", "Qabala Rayonu", "Qax Rayonu", "Qazax Rayonu", "Qobustan Rayonu", "Quba Rayonu", "Qubadli Rayonu", "Qusar Rayonu", "Saatli Rayonu", "Sabirabad Rayonu", "Saki Rayonu", "Saki Sahari", "Salyan Rayonu", "Samaxi Rayonu", "Samkir Rayonu", "Samux Rayonu", "Siyazan Rayonu", "Sumqayit Sahari", "Susa Rayonu", "Susa Sahari", "Tartar Rayonu", "Tovuz Rayonu", "Ucar Rayonu", "Xacmaz Rayonu", "Xankandi Sahari", "Xanlar Rayonu", "Xizi Rayonu", "Xocali Rayonu", "Xocavand Rayonu", "Yardimli Rayonu", "Yevlax Rayonu", "Yevlax Sahari", "Zangilan Rayonu", "Zaqatala Rayonu", "Zardab Rayonu"],
"BS" => ["Acklins and Crooked Islands", "Bimini", "Cat Island", "Exuma", "Freeport", "Fresh Creek", "Governor's Harbour", "Green Turtle Cay", "Harbour Island", "High Rock", "Inagua", "Kemps Bay", "Long Island", "Marsh Harbour", "Mayaguana", "New Providence", "Nicholls Town and Berry Islands", "Ragged Island", "Rock Sound", "San Salvador and Rum Cay", "Sandy Point"],
"BH" => ["Al Hadd", "Al Manamah", "Al Mintaqah al Gharbiyah", "Al Mintaqah al Wusta", "Al Mintaqah ash Shamaliyah", "Al Muharraq", "Ar Rifa' wa al Mintaqah al Janubiyah", "Jidd Hafs", "Juzur Hawar", "Madinat 'Isa", "Madinat Hamad", "Sitrah"],
"BD" => ["Barguna", "Barisal", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur", "Bandarban", "Brahmanbaria", "Chandpur", "Chittagong", "Comilla", "Cox's Bazar", "Feni", "Khagrachari", "Lakshmipur", "Noakhali", "Rangamati", "Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Jamalpur", "Kishoreganj", "Madaripur", "Manikganj", "Munshiganj", "Mymensingh", "Narayanganj", "Narsingdi", "Netrokona", "Rajbari", "Shariatpur", "Sherpur", "Tangail", "Bagerhat", "Chuadanga", "Jessore", "Jhenaidah", "Khulna", "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira", "Bogra", "Dinajpur", "Gaibandha", "Jaipurhat", "Kurigram", "Lalmonirhat", "Naogaon", "Natore", "Nawabganj", "Nilphamari", "Pabna", "Panchagarh", "Rajshahi", "Rangpur", "Sirajganj", "Thakurgaon", "Habiganj", "Maulvi bazar", "Sunamganj", "Sylhet"],
"BB" => ["Bridgetown", "Christ Church", "Saint Andrew", "Saint George", "Saint James", "Saint John", "Saint Joseph", "Saint Lucy", "Saint Michael", "Saint Peter", "Saint Philip", "Saint Thomas"],
"BY" => ["Brestskaya (Brest)", "Homyel'skaya (Homyel')", "Horad Minsk", "Hrodzyenskaya (Hrodna)", "Mahilyowskaya (Mahilyow)", "Minskaya", "Vitsyebskaya (Vitsyebsk)"],
"BE" => ["Antwerpen", "Brabant Wallon", "Brussels Capitol Region", "Hainaut", "Liege", "Limburg", "Luxembourg", "Namur", "Oost-Vlaanderen", "Vlaams Brabant", "West-Vlaanderen"],
"BZ" => ["Belize", "Cayo", "Corozal", "Orange Walk", "Stann Creek", "Toledo"],
"BJ" => ["Alibori", "Atakora", "Atlantique", "Borgou", "Collines", "Couffo", "Donga", "Littoral", "Mono", "Oueme", "Plateau", "Zou"],
"BM" => ["Devonshire", "Hamilton", "Hamilton", "Paget", "Pembroke", "Saint George", "Saint Georges", "Sandys", "Smiths", "Southampton", "Warwick"],
"BT" => ["Bumthang", "Chhukha", "Chirang", "Daga", "Geylegphug", "Ha", "Lhuntshi", "Mongar", "Paro", "Pemagatsel", "Punakha", "Samchi", "Samdrup Jongkhar", "Shemgang", "Tashigang", "Thimphu", "Tongsa", "Wangdi Phodrang"],
"BO" => ["Beni", "Chuquisaca", "Cochabamba", "La Paz", "Oruro", "Pando", "Potosi", "Santa Cruz", "Tarija"],
"BA" => ["Federation of Bosnia and Herzegovina", "Republika Srpska"],
"BW" => ["Central", "Chobe", "Francistown", "Gaborone", "Ghanzi", "Kgalagadi", "Kgatleng", "Kweneng", "Lobatse", "Ngamiland", "North-East", "Selebi-Pikwe", "South-East", "Southern"],
"BV" => ["Bouvet Island"],
"BR" => [["AC", "Acre"], ["AL", "Alagoas"], ["AP", "Amapa"], ["AM", "Amazonas"], ["BA", "Bahia"], ["CE", "Ceara"], ["DF", "Distrito Federal"], ["ES", "Espirito Santo"], ["FN", "Fernando de Noronha"], ["GO", "Goias"], ["MA", "Maranhao"], ["MT", "Mato Grosso"], ["MS", "Mato Grosso do Sul"], ["MG", "Minas Gerais"], ["PA", "Para"], ["PB", "Paraiba"], ["PE", "Pernambuco"], ["PI", "Piaui"], ["PR", "Parana"], ["RJ", "Rio de Janeiro"], ["RN", "Rio Grande do Norte"], ["RS", "Rio Grande do Sul"], ["RO", "Rondonia"], ["RR", "Roraima"], ["SC", "Santa Catarina"], ["SE", "Sergipe"], ["SP", "Sao Paulo"], ["TO", "Tocatins"]],
"IO" => ["British Indian Ocean Territory"],
"VG" => ["Anegada", "Jost Van Dyke", "Tortola", "Virgin Gorda"],
"BN" => ["Belait", "Brunei and Muara", "Temburong", "Tutong"],
"BG" => ["Blagoevgrad", "Burgas", "Dobrich", "Gabrovo", "Khaskovo", "Kurdzhali", "Kyustendil", "Lovech", "Montana", "Pazardzhik", "Pernik", "Pleven", "Plovdiv", "Razgrad", "Ruse", "Shumen", "Silistra", "Sliven", "Smolyan", "Sofiya", "Sofiya-Grad", "Stara Zagora", "Turgovishte", "Varna", "Veliko Turnovo", "Vidin", "Vratsa", "Yambol"],
"BF" => ["Bale", "Bam", "Banwa", "Bazega", "Bougouriba", "Boulgou", "Boulkiemde", "Comoe", "Ganzourgou", "Gnagna", "Gourma", "Houet", "Ioba", "Kadiogo", "Kenedougou", "Komandjari", "Kompienga", "Kossi", "Koupelogo", "Kouritenga", "Kourweogo", "Leraba", "Loroum", "Mouhoun", "Nahouri", "Namentenga", "Naumbiel", "Nayala", "Oubritenga", "Oudalan", "Passore", "Poni", "Samentenga", "Sanguie", "Seno", "Sissili", "Soum", "Sourou", "Tapoa", "Tuy", "Yagha", "Yatenga", "Ziro", "Zondomo", "Zoundweogo"],
"MM" => ["Ayeyarwady", "Bago", "Chin State", "Kachin State", "Kayah State", "Kayin State", "Magway", "Mandalay", "Mon State", "Rakhine State", "Sagaing", "Shan State", "Tanintharyi", "Yangon"],
"BI" => ["Bubanza", "Bujumbura", "Bururi", "Cankuzo", "Cibitoke", "Gitega", "Karuzi", "Kayanza", "Kirundo", "Makamba", "Muramvya", "Muyinga", "Mwaro", "Ngozi", "Rutana", "Ruyigi"],
"KH" => ["Banteay Mean Cheay", "Batdambang", "Kampong Cham", "Kampong Chhnang", "Kampong Spoe", "Kampong Thum", "Kampot", "Kandal", "Kaoh Kong", "Keb", "Kracheh", "Mondol Kiri", "Otdar Mean Cheay", "Pailin", "Phnum Penh", "Pouthisat", "Preah Seihanu (Sihanoukville)", "Preah Vihear", "Prey Veng", "Rotanah Kiri", "Siem Reab", "Stoeng Treng", "Svay Rieng", "Takev"],
"CM" => ["Adamaoua", "Centre", "Est", "Extreme-Nord", "Littoral", "Nord", "Nord-Ouest", "Ouest", "Sud", "Sud-Ouest"],
"CA" => [["AB", "Alberta"], ["BC", "British Columbia"], ["MB", "Manitoba"], ["NB", "New Brunswick"], ["NL", "Newfoundland and Labrador"], ["NT", "Northwest Territories"], ["NS", "Nova Scotia"], ["NU", "Nunavut"], ["ON", "Ontario"], ["PE", "Prince Edward Island"], ["QC", "Quebec"], ["SK", "Saskatchewan"], ["YT", "Yukon Territory"]],
"CV" => ["Boa Vista", "Brava", "Maio", "Mosteiros", "Paul", "Porto Novo", "Praia", "Ribeira Grande", "Sal", "Santa Catarina", "Santa Cruz", "Sao Domingos", "Sao Filipe", "Sao Nicolau", "Sao Vicente", "Tarrafal"],
"KY" => ["Creek", "Eastern", "Midland", "South Town", "Spot Bay", "Stake Bay", "West End", "Western"],
"CF" => ["Bamingui-Bangoran", "Bangui", "Basse-Kotto", "Gribingui", "Haut-Mbomou", "Haute-Kotto", "Haute-Sangha", "Kemo-Gribingui", "Lobaye", "Mbomou", "Nana-Mambere", "Ombella-Mpoko", "Ouaka", "Ouham", "Ouham-Pende", "Sangha", "Vakaga"],
"TD" => ["Batha", "Biltine", "Borkou-Ennedi-Tibesti", "Chari-Baguirmi", "Guera", "Kanem", "Lac", "Logone Occidental", "Logone Oriental", "Mayo-Kebbi", "Moyen-Chari", "Ouaddai", "Salamat", "Tandjile"],
"CL" => ["Aisen del General Carlos Ibanez del Campo", "Antofagasta", "Araucania", "Atacama", "Bio-Bio", "Coquimbo", "Libertador General Bernardo O'Higgins", "Los Lagos", "Magallanes y de la Antartica Chilena", "Maule", "Region Metropolitana (Santiago)", "Tarapaca", "Valparaiso"],
"CN" => ["Anhui", "Beijing", "Chongqing", "Fujian", "Gansu", "Guangdong", "Guangxi", "Guizhou", "Hainan", "Hebei", "Heilongjiang", "Henan", "Hubei", "Hunan", "Jiangsu", "Jiangxi", "Jilin", "Liaoning", "Nei Mongol", "Ningxia", "Qinghai", "Shaanxi", "Shandong", "Shanghai", "Shanxi", "Sichuan", "Tianjin", "Xinjiang", "Xizang (Tibet)", "Yunnan", "Zhejiang"],
"CX" => ["Christmas Island"],
"CC" => ["Direction Island", "Home Island", "Horsburgh Island", "North Keeling Island", "South Island", "West Island"],
"CO" => ["Amazonas", "Antioquia", "Arauca", "Atlantico", "Bolivar", "Boyaca", "Caldas", "Caqueta", "Casanare", "Cauca", "Cesar", "Choco", "Cordoba", "Cundinamarca", "Distrito Capital de Santa Fe de Bogota", "Guainia", "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta", "Narino", "Norte de Santander", "Putumayo", "Quindio", "Risaralda", "San Andres y Providencia", "Santander", "Sucre", "Tolima", "Valle del Cauca", "Vaupes", "Vichada"],
"KM" => ["Anjouan (Nzwani)", "Domoni", "Fomboni", "Grande Comore (Njazidja)", "Moheli (Mwali)", "Moroni", "Moutsamoudou"],
"CD" => ["Bandundu", "Bas-Congo", "Equateur", "Kasai-Occidental", "Kasai-Oriental", "Katanga", "Kinshasa", "Maniema", "Nord-Kivu", "Orientale", "Sud-Kivu"],
"CG" => ["Bouenza", "Brazzaville", "Cuvette", "Kouilou", "Lekoumou", "Likouala", "Niari", "Plateaux", "Pool", "Sangha"],
"CK" => ["Aitutaki", "Atiu", "Avarua", "Mangaia", "Manihiki", "Manuae", "Mauke", "Mitiaro", "Nassau Island", "Palmerston", "Penrhyn", "Pukapuka", "Rakahanga", "Rarotonga", "Suwarrow", "Takutea"],
"CR" => ["Alajuela", "Cartago", "Guanacaste", "Heredia", "Limon", "Puntarenas", "San Jose"],
"CI" => ["Abengourou", "Abidjan", "Aboisso", "Adiake'", "Adzope", "Agboville", "Agnibilekrou", "Ale'pe'", "Bangolo", "Beoumi", "Biankouma", "Bocanda", "Bondoukou", "Bongouanou", "Bouafle", "Bouake", "Bouna", "Boundiali", "Dabakala", "Dabon", "Daloa", "Danane", "Daoukro", "Dimbokro", "Divo", "Duekoue", "Ferkessedougou", "Gagnoa", "Grand Bassam", "Grand-Lahou", "Guiglo", "Issia", "Jacqueville", "Katiola", "Korhogo", "Lakota", "Man", "Mankono", "Mbahiakro", "Odienne", "Oume", "Sakassou", "San-Pedro", "Sassandra", "Seguela", "Sinfra", "Soubre", "Tabou", "Tanda", "Tiassale", "Tiebissou", "Tingrela", "Touba", "Toulepleu", "Toumodi", "Vavoua", "Yamoussoukro", "Zuenoula"],
"HR" => ["Bjelovarsko-Bilogorska Zupanija", "Brodsko-Posavska Zupanija", "Dubrovacko-Neretvanska Zupanija", "Istarska Zupanija", "Karlovacka Zupanija", "Koprivnicko-Krizevacka Zupanija", "Krapinsko-Zagorska Zupanija", "Licko-Senjska Zupanija", "Medimurska Zupanija", "Osjecko-Baranjska Zupanija", "Pozesko-Slavonska Zupanija", "Primorsko-Goranska Zupanija", "Sibensko-Kninska Zupanija", "Sisacko-Moslavacka Zupanija", "Splitsko-Dalmatinska Zupanija", "Varazdinska Zupanija", "Viroviticko-Podravska Zupanija", "Vukovarsko-Srijemska Zupanija", "Zadarska Zupanija", "Zagreb", "Zagrebacka Zupanija"],
"CU" => ["Camaguey", "Ciego de Avila", "Cienfuegos", "Ciudad de La Habana", "Granma", "Guantanamo", "Holguin", "Isla de la Juventud", "La Habana", "Las Tunas", "Matanzas", "Pinar del Rio", "Sancti Spiritus", "Santiago de Cuba", "Villa Clara"],
"CY" => ["Famagusta", "Kyrenia", "Larnaca", "Limassol", "Nicosia", "Paphos"],
"CZ" => ["Brnensky", "Budejovicky", "Jihlavsky", "Karlovarsky", "Kralovehradecky", "Liberecky", "Olomoucky", "Ostravsky", "Pardubicky", "Plzensky", "Praha", "Stredocesky", "Ustecky", "Zlinsky"],
"DK" => ["Arhus", "Bornholm", "Fredericksberg", "Frederiksborg", "Fyn", "Kobenhavn", "Kobenhavns", "Nordjylland", "Ribe", "Ringkobing", "Roskilde", "Sonderjylland", "Storstrom", "Vejle", "Vestsjalland", "Viborg"],
"DJ" => ["'Ali Sabih", "Dikhil", "Djibouti", "Obock", "Tadjoura"],
"DM" => ["Saint Andrew", "Saint David", "Saint George", "Saint John", "Saint Joseph", "Saint Luke", "Saint Mark", "Saint Patrick", "Saint Paul", "Saint Peter"],
"DO" => ["Azua", "Baoruco", "Barahona", "Dajabon", "Distrito Nacional", "Duarte", "El Seibo", "Elias Pina", "Espaillat", "Hato Mayor", "Independencia", "La Altagracia", "La Romana", "La Vega", "Maria Trinidad Sanchez", "Monsenor Nouel", "Monte Cristi", "Monte Plata", "Pedernales", "Peravia", "Puerto Plata", "Salcedo", "Samana", "San Cristobal", "San Juan", "San Pedro de Macoris", "Sanchez Ramirez", "Santiago", "Santiago Rodriguez", "Valverde"],
"TP" => ["East Timor"],
"EC" => ["Azuay", "Bolivar", "Canar", "Carchi", "Chimborazo", "Cotopaxi", "El Oro", "Esmeraldas", "Galapagos", "Guayas", "Imbabura", "Loja", "Los Rios", "Manabi", "Morona-Santiago", "Napo", "Orellana", "Pastaza", "Pichincha", "Sucumbios", "Tungurahua", "Zamora-Chinchipe"],
"EG" => ["Ad Daqahliyah", "Al Bahr al Ahmar", "Al Buhayrah", "Al Fayyum", "Al Gharbiyah", "Al Iskandariyah", "Al Isma'iliyah", "Al Jizah", "Al Minufiyah", "Al Minya", "Al Qahirah", "Al Qalyubiyah", "Al Wadi al Jadid", "As Suways", "Ash Sharqiyah", "Aswan", "Asyut", "Bani Suwayf", "Bur Sa'id", "Dumyat", "Janub Sina'", "Kafr ash Shaykh", "Matruh", "Qina", "Shamal Sina'", "Suhaj"],
"SV" => ["Ahuachapan", "Cabanas", "Chalatenango", "Cuscatlan", "La Libertad", "La Paz", "La Union", "Morazan", "San Miguel", "San Salvador", "San Vicente", "Santa Ana", "Sonsonate", "Usulutan"],
"GQ" => ["Annobon", "Bioko Norte", "Bioko Sur", "Centro Sur", "Kie-Ntem", "Litoral", "Wele-Nzas"],
"ER" => ["Akale Guzay", "Barka", "Denkel", "Hamasen", "Sahil", "Semhar", "Senhit", "Seraye"],
"EE" => ["Harjumaa (Tallinn)", "Hiiumaa (Kardla)", "Ida-Virumaa (Johvi)", "Jarvamaa (Paide)", "Jogevamaa (Jogeva)", "Laane-Virumaa (Rakvere)", "Laanemaa (Haapsalu)", "Parnumaa (Parnu)", "Polvamaa (Polva)", "Raplamaa (Rapla)", "Saaremaa (Kuessaare)", "Tartumaa (Tartu)", "Valgamaa (Valga)", "Viljandimaa (Viljandi)", "Vorumaa (Voru)"],
"ET" => ["Adis Abeba (Addis Ababa)", "Afar", "Amara", "Dire Dawa", "Gambela Hizboch", "Hareri Hizb", "Oromiya", "Sumale", "Tigray", "YeDebub Biheroch Bihereseboch na Hizboch"],
"FK" => ["Falkland Islands (Islas Malvinas)"],
"FO" => ["Bordoy", "Eysturoy", "Mykines", "Sandoy", "Skuvoy", "Streymoy", "Suduroy", "Tvoroyri", "Vagar"],
"FJ" => ["Central", "Eastern", "Northern", "Rotuma", "Western"],
"FI" => ["Aland", "Etela-Suomen Laani", "Ita-Suomen Laani", "Lansi-Suomen Laani", "Lappi", "Oulun Laani"],
"FR" => ["Alsace", "Aquitaine", "Auvergne", "Basse-Normandie", "Bourgogne", "Bretagne", "Centre", "Champagne-Ardenne", "Corse", "Franche-Comte", "Haute-Normandie", "Ile-de-France", "Languedoc-Roussillon", "Limousin", "Lorraine", "Midi-Pyrenees", "Nord-Pas-de-Calais", "Pays de la Loire", "Picardie", "Poitou-Charentes", "Provence-Alpes-Cote d'Azur", "Rhone-Alpes"],
"FX" => ["France, Metropolitan"],
"GF" => ["French Guiana"],
"PF" => ["Archipel des Marquises", "Archipel des Tuamotu", "Archipel des Tubuai", "Iles du Vent", "Iles Sous-le-Vent"],
"TF" => ["Adelie Land", "Ile Crozet", "Iles Kerguelen", "Iles Saint-Paul et Amsterdam"],
"GA" => ["Estuaire", "Haut-Ogooue", "Moyen-Ogooue", "Ngounie", "Nyanga", "Ogooue-Ivindo", "Ogooue-Lolo", "Ogooue-Maritime", "Woleu-Ntem"],
"GM" => ["Banjul", "Central River", "Lower River", "North Bank", "Upper River", "Western"],
"GZ" => ["Gaza Strip"],
"GE" => ["Abashis", "Abkhazia or Ap'khazet'is Avtonomiuri Respublika (Sokhumi)", "Adigenis", "Ajaria or Acharis Avtonomiuri Respublika (Bat'umi)", "Akhalgoris", "Akhalk'alak'is", "Akhalts'ikhis", "Akhmetis", "Ambrolauris", "Aspindzis", "Baghdat'is", "Bolnisis", "Borjomis", "Ch'khorotsqus", "Ch'okhatauris", "Chiat'ura", "Dedop'listsqaros", "Dmanisis", "Dushet'is", "Gardabanis", "Gori", "Goris", "Gurjaanis", "Javis", "K'arelis", "K'ut'aisi", "Kaspis", "Kharagaulis", "Khashuris", "Khobis", "Khonis", "Lagodekhis", "Lanch'khut'is", "Lentekhis", "Marneulis", "Martvilis", "Mestiis", "Mts'khet'is", "Ninotsmindis", "Onis", "Ozurget'is", "P'ot'i", "Qazbegis", "Qvarlis", "Rust'avi", "Sach'kheris", "Sagarejos", "Samtrediis", "Senakis", "Sighnaghis", "T'bilisi", "T'elavis", "T'erjolis", "T'et'ritsqaros", "T'ianet'is", "Tqibuli", "Ts'ageris", "Tsalenjikhis", "Tsalkis", "Tsqaltubo", "Vanis", "Zestap'onis", "Zugdidi", "Zugdidis"],
"DE" => ["Baden-Wuerttemberg", "Bayern", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen", "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen", "Sachsen-Anhalt", "Schleswig-Holstein", "Thueringen"],
"GH" => ["Ashanti", "Brong-Ahafo", "Central", "Eastern", "Greater Accra", "Northern", "Upper East", "Upper West", "Volta", "Western"],
"GI" => ["Gibraltar"],
"GO" => ["Ile du Lys", "Ile Glorieuse"],
"GR" => ["Aitolia kai Akarnania", "Akhaia", "Argolis", "Arkadhia", "Arta", "Attiki", "Ayion Oros (Mt. Athos)", "Dhodhekanisos", "Drama", "Evritania", "Evros", "Evvoia", "Florina", "Fokis", "Fthiotis", "Grevena", "Ilia", "Imathia", "Ioannina", "Irakleion", "Kardhitsa", "Kastoria", "Kavala", "Kefallinia", "Kerkyra", "Khalkidhiki", "Khania", "Khios", "Kikladhes", "Kilkis", "Korinthia", "Kozani", "Lakonia", "Larisa", "Lasithi", "Lesvos", "Levkas", "Magnisia", "Messinia", "Pella", "Pieria", "Preveza", "Rethimni", "Rodhopi", "Samos", "Serrai", "Thesprotia", "Thessaloniki", "Trikala", "Voiotia", "Xanthi", "Zakinthos"],
"GL" => ["Avannaa (Nordgronland)", "Kitaa (Vestgronland)", "Tunu (Ostgronland)"],
"GD" => ["Carriacou and Petit Martinique", "Saint Andrew", "Saint David", "Saint George", "Saint John", "Saint Mark", "Saint Patrick"],
"GP" => ["Basse-Terre", "Grande-Terre", "Iles de la Petite Terre", "Iles des Saintes", "Marie-Galante"],
"GU" => ["Guam"],
"GT" => ["Alta Verapaz", "Baja Verapaz", "Chimaltenango", "Chiquimula", "El Progreso", "Escuintla", "Guatemala", "Huehuetenango", "Izabal", "Jalapa", "Jutiapa", "Peten", "Quetzaltenango", "Quiche", "Retalhuleu", "Sacatepequez", "San Marcos", "Santa Rosa", "Solola", "Suchitepequez", "Totonicapan", "Zacapa"],
"GK" => ["Castel", "Forest", "St. Andrew", "St. Martin", "St. Peter Port", "St. Pierre du Bois", "St. Sampson", "St. Saviour", "Torteval", "Vale"],
"GN" => ["Beyla", "Boffa", "Boke", "Conakry", "Coyah", "Dabola", "Dalaba", "Dinguiraye", "Dubreka", "Faranah", "Forecariah", "Fria", "Gaoual", "Gueckedou", "Kankan", "Kerouane", "Kindia", "Kissidougou", "Koubia", "Koundara", "Kouroussa", "Labe", "Lelouma", "Lola", "Macenta", "Mali", "Mamou", "Mandiana", "Nzerekore", "Pita", "Siguiri", "Telimele", "Tougue", "Yomou"],
"GW" => ["Bafata", "Biombo", "Bissau", "Bolama-Bijagos", "Cacheu", "Gabu", "Oio", "Quinara", "Tombali"],
"GY" => ["Barima-Waini", "Cuyuni-Mazaruni", "Demerara-Mahaica", "East Berbice-Corentyne", "Essequibo Islands-West Demerara", "Mahaica-Berbice", "Pomeroon-Supenaam", "Potaro-Siparuni", "Upper Demerara-Berbice", "Upper Takutu-Upper Essequibo"],
"HT" => ["Artibonite", "Centre", "Grand'Anse", "Nord", "Nord-Est", "Nord-Ouest", "Ouest", "Sud", "Sud-Est"],
"HM" => ["Heard Island and McDonald Islands"],
"VA" => ["Holy See (Vatican City)"],
"HN" => ["Atlantida", "Choluteca", "Colon", "Comayagua", "Copan", "Cortes", "El Paraiso", "Francisco Morazan", "Gracias a Dios", "Intibuca", "Islas de la Bahia", "La Paz", "Lempira", "Ocotepeque", "Olancho", "Santa Barbara", "Valle", "Yoro"],
"HK" => ["Hong Kong"],
"HQ" => ["Howland Island"],
"HU" => ["Bacs-Kiskun", "Baranya", "Bekes", "Bekescsaba", "Borsod-Abauj-Zemplen", "Budapest", "Csongrad", "Debrecen", "Dunaujvaros", "Eger", "Fejer", "Gyor", "Gyor-Moson-Sopron", "Hajdu-Bihar", "Heves", "Hodmezovasarhely", "Jasz-Nagykun-Szolnok", "Kaposvar", "Kecskemet", "Komarom-Esztergom", "Miskolc", "Nagykanizsa", "Nograd", "Nyiregyhaza", "Pecs", "Pest", "Somogy", "Sopron", "Szabolcs-Szatmar-Bereg", "Szeged", "Szekesfehervar", "Szolnok", "Szombathely", "Tatabanya", "Tolna", "Vas", "Veszprem", "Veszprem", "Zala", "Zalaegerszeg"],
"IS" => ["Akranes", "Akureyri", "Arnessysla", "Austur-Bardhastrandarsysla", "Austur-Hunavatnssysla", "Austur-Skaftafellssysla", "Borgarfjardharsysla", "Dalasysla", "Eyjafjardharsysla", "Gullbringusysla", "Hafnarfjordhur", "Husavik", "Isafjordhur", "Keflavik", "Kjosarsysla", "Kopavogur", "Myrasysla", "Neskaupstadhur", "Nordhur-Isafjardharsysla", "Nordhur-Mulasys-la", "Nordhur-Thingeyjarsysla", "Olafsfjordhur", "Rangarvallasysla", "Reykjavik", "Saudharkrokur", "Seydhisfjordhur", "Siglufjordhur", "Skagafjardharsysla", "Snaefellsnes-og Hnappadalssysla", "Strandasysla", "Sudhur-Mulasysla", "Sudhur-Thingeyjarsysla", "Vesttmannaeyjar", "Vestur-Bardhastrandarsysla", "Vestur-Hunavatnssysla", "Vestur-Isafjardharsysla", "Vestur-Skaftafellssysla"],
"IN" => ["Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli", "Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Orissa", "Pondicherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Tripura", "Uttar Pradesh", "Uttaranchal", "West Bengal"],
"ID" => ["Aceh", "Bali", "Banten", "Bengkulu", "East Timor", "Gorontalo", "Irian Jaya", "Jakarta Raya", "Jambi", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Kalimantan Barat", "Kalimantan Selatan", "Kalimantan Tengah", "Kalimantan Timur", "Kepulauan Bangka Belitung", "Lampung", "Maluku", "Maluku Utara", "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Riau", "Sulawesi Selatan", "Sulawesi Tengah", "Sulawesi Tenggara", "Sulawesi Utara", "Sumatera Barat", "Sumatera Selatan", "Sumatera Utara", "Yogyakarta"],
"IR" => ["Ardabil", "Azarbayjan-e Gharbi", "Azarbayjan-e Sharqi", "Bushehr", "Chahar Mahall va Bakhtiari", "Esfahan", "Fars", "Gilan", "Golestan", "Hamadan", "Hormozgan", "Ilam", "Kerman", "Kermanshah", "Khorasan", "Khuzestan", "Kohgiluyeh va Buyer Ahmad", "Kordestan", "Lorestan", "Markazi", "Mazandaran", "Qazvin", "Qom", "Semnan", "Sistan va Baluchestan", "Tehran", "Yazd", "Zanjan"],
"IQ" => ["Al Anbar", "Al Basrah", "Al Muthanna", "Al Qadisiyah", "An Najaf", "Arbil", "As Sulaymaniyah", "At Ta'mim", "Babil", "Baghdad", "Dahuk", "Dhi Qar", "Diyala", "Karbala'", "Maysan", "Ninawa", "Salah ad Din", "Wasit"],
"IE" => ["Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", "Westmeath", "Wexford", "Wicklow"],
"EI" => ["Antrim", "Ards", "Armagh", "Ballymena", "Ballymoney", "Banbridge", "Belfast", "Carrickfergus", "Castlereagh", "Coleraine", "Cookstown", "Craigavon", "Derry", "Down", "Dungannon", "Fermanagh", "Larne", "Limavady", "Lisburn", "Magherafelt", "Moyle", "Newry and Mourne", "Newtownabbey", "North Down", "Omagh", "Strabane"],
"IL" => ["Central", "Haifa", "Jerusalem", "Northern", "Southern", "Tel Aviv"],
"IT" => ["Abruzzi", "Basilicata", "Calabria", "Campania", "Emilia-Romagna", "Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardia", "Marche", "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana", "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto"],
"JM" => ["Clarendon", "Hanover", "Kingston", "Manchester", "Portland", "Saint Andrew", "Saint Ann", "Saint Catherine", "Saint Elizabeth", "Saint James", "Saint Mary", "Saint Thomas", "Trelawny", "Westmoreland"],
"JP" => ["Aichi", "Akita", "Aomori", "Chiba", "Ehime", "Fukui", "Fukuoka", "Fukushima", "Gifu", "Gumma", "Hiroshima", "Hokkaido", "Hyogo", "Ibaraki", "Ishikawa", "Iwate", "Kagawa", "Kagoshima", "Kanagawa", "Kochi", "Kumamoto", "Kyoto", "Mie", "Miyagi", "Miyazaki", "Nagano", "Nagasaki", "Nara", "Niigata", "Oita", "Okayama", "Okinawa", "Osaka", "Saga", "Saitama", "Shiga", "Shimane", "Shizuoka", "Tochigi", "Tokushima", "Tokyo", "Tottori", "Toyama", "Wakayama", "Yamagata", "Yamaguchi", "Yamanashi"],
"DQ" => ["Jarvis Island"],
"JE" => ["Jersey"],
"JQ" => ["Johnston Atoll"],
"JO" => ["'Amman", "Ajlun", "Al 'Aqabah", "Al Balqa'", "Al Karak", "Al Mafraq", "At Tafilah", "Az Zarqa'", "Irbid", "Jarash", "Ma'an", "Madaba"],
"JU" => ["Juan de Nova Island"],
"KZ" => ["Almaty", "Aqmola", "Aqtobe", "Astana", "Atyrau", "Batys Qazaqstan", "Bayqongyr", "Mangghystau", "Ongtustik Qazaqstan", "Pavlodar", "Qaraghandy", "Qostanay", "Qyzylorda", "Shyghys Qazaqstan", "Soltustik Qazaqstan", "Zhambyl"],
"KE" => ["Central", "Coast", "Eastern", "Nairobi Area", "North Eastern", "Nyanza", "Rift Valley", "Western"],
"KI" => ["Abaiang", "Abemama", "Aranuka", "Arorae", "Banaba", "Banaba", "Beru", "Butaritari", "Central Gilberts", "Gilbert Islands", "Kanton", "Kiritimati", "Kuria", "Line Islands", "Line Islands", "Maiana", "Makin", "Marakei", "Nikunau", "Nonouti", "Northern Gilberts", "Onotoa", "Phoenix Islands", "Southern Gilberts", "Tabiteuea", "Tabuaeran", "Tamana", "Tarawa", "Tarawa", "Teraina"],
"KP" => ["Chagang-do (Chagang Province)", "Hamgyong-bukto (North Hamgyong Province)", "Hamgyong-namdo (South Hamgyong Province)", "Hwanghae-bukto (North Hwanghae Province)", "Hwanghae-namdo (South Hwanghae Province)", "Kaesong-si (Kaesong City)", "Kangwon-do (Kangwon Province)", "Namp'o-si (Namp'o City)", "P'yongan-bukto (North P'yongan Province)", "P'yongan-namdo (South P'yongan Province)", "P'yongyang-si (P'yongyang City)", "Yanggang-do (Yanggang Province)"],
"KR" => ["Ch'ungch'ong-bukto", "Ch'ungch'ong-namdo", "Cheju-do", "Cholla-bukto", "Cholla-namdo", "Inch'on-gwangyoksi", "Kangwon-do", "Kwangju-gwangyoksi", "Kyonggi-do", "Kyongsang-bukto", "Kyongsang-namdo", "Pusan-gwangyoksi", "Soul-t'ukpyolsi", "Taegu-gwangyoksi", "Taejon-gwangyoksi", "Ulsan-gwangyoksi"],
"KW" => ["Al 'Asimah", "Al Ahmadi", "Al Farwaniyah", "Al Jahra'", "Hawalli"],
"KG" => ["Batken Oblasty", "Bishkek Shaary", "Chuy Oblasty (Bishkek)", "Jalal-Abad Oblasty", "Naryn Oblasty", "Osh Oblasty", "Talas Oblasty", "Ysyk-Kol Oblasty (Karakol)"],
"LA" => ["Attapu", "Bokeo", "Bolikhamxai", "Champasak", "Houaphan", "Khammouan", "Louangnamtha", "Louangphabang", "Oudomxai", "Phongsali", "Salavan", "Savannakhet", "Viangchan", "Viangchan", "Xaignabouli", "Xaisomboun", "Xekong", "Xiangkhoang"],
"LV" => ["Aizkraukles Rajons", "Aluksnes Rajons", "Balvu Rajons", "Bauskas Rajons", "Cesu Rajons", "Daugavpils", "Daugavpils Rajons", "Dobeles Rajons", "Gulbenes Rajons", "Jekabpils Rajons", "Jelgava", "Jelgavas Rajons", "Jurmala", "Kraslavas Rajons", "Kuldigas Rajons", "Leipaja", "Liepajas Rajons", "Limbazu Rajons", "Ludzas Rajons", "Madonas Rajons", "Ogres Rajons", "Preilu Rajons", "Rezekne", "Rezeknes Rajons", "Riga", "Rigas Rajons", "Saldus Rajons", "Talsu Rajons", "Tukuma Rajons", "Valkas Rajons", "Valmieras Rajons", "Ventspils", "Ventspils Rajons"],
"LB" => ["Beyrouth", "Ech Chimal", "Ej Jnoub", "El Bekaa", "Jabal Loubnane"],
"LS" => ["Berea", "Butha-Buthe", "Leribe", "Mafeteng", "Maseru", "Mohales Hoek", "Mokhotlong", "Qacha's Nek", "Quthing", "Thaba-Tseka"],
"LR" => ["Bomi", "Bong", "Grand Bassa", "Grand Cape Mount", "Grand Gedeh", "Grand Kru", "Lofa", "Margibi", "Maryland", "Montserrado", "Nimba", "River Cess", "Sinoe"],
"LY" => ["Ajdabiya", "Al 'Aziziyah", "Al Fatih", "Al Jabal al Akhdar", "Al Jufrah", "Al Khums", "Al Kufrah", "An Nuqat al Khams", "Ash Shati'", "Awbari", "Az Zawiyah", "Banghazi", "Darnah", "Ghadamis", "Gharyan", "Misratah", "Murzuq", "Sabha", "Sawfajjin", "Surt", "Tarabulus", "Tarhunah", "Tubruq", "Yafran", "Zlitan"],
"LI" => ["Balzers", "Eschen", "Gamprin", "Mauren", "Planken", "Ruggell", "Schaan", "Schellenberg", "Triesen", "Triesenberg", "Vaduz"],
"LT" => ["Akmenes Rajonas", "Alytaus Rajonas", "Alytus", "Anyksciu Rajonas", "Birstonas", "Birzu Rajonas", "Druskininkai", "Ignalinos Rajonas", "Jonavos Rajonas", "Joniskio Rajonas", "Jurbarko Rajonas", "Kaisiadoriu Rajonas", "Kaunas", "Kauno Rajonas", "Kedainiu Rajonas", "Kelmes Rajonas", "Klaipeda", "Klaipedos Rajonas", "Kretingos Rajonas", "Kupiskio Rajonas", "Lazdiju Rajonas", "Marijampole", "Marijampoles Rajonas", "Mazeikiu Rajonas", "Moletu Rajonas", "Neringa Pakruojo Rajonas", "Palanga", "Panevezio Rajonas", "Panevezys", "Pasvalio Rajonas", "Plunges Rajonas", "Prienu Rajonas", "Radviliskio Rajonas", "Raseiniu Rajonas", "Rokiskio Rajonas", "Sakiu Rajonas", "Salcininku Rajonas", "Siauliai", "Siauliu Rajonas", "Silales Rajonas", "Silutes Rajonas", "Sirvintu Rajonas", "Skuodo Rajonas", "Svencioniu Rajonas", "Taurages Rajonas", "Telsiu Rajonas", "Traku Rajonas", "Ukmerges Rajonas", "Utenos Rajonas", "Varenos Rajonas", "Vilkaviskio Rajonas", "Vilniaus Rajonas", "Vilnius", "Zarasu Rajonas"],
"LU" => ["Diekirch", "Grevenmacher", "Luxembourg"],
"MO" => ["Macau"],
"MK" => ["Aracinovo", "Bac", "Belcista", "Berovo", "Bistrica", "Bitola", "Blatec", "Bogdanci", "Bogomila", "Bogovinje", "Bosilovo", "Brvenica", "Cair (Skopje)", "Capari", "Caska", "Cegrane", "Centar (Skopje)", "Centar Zupa", "Cesinovo", "Cucer-Sandevo", "Debar", "Delcevo", "Delogozdi", "Demir Hisar", "Demir Kapija", "Dobrusevo", "Dolna Banjica", "Dolneni", "Dorce Petrov (Skopje)", "Drugovo", "Dzepciste", "Gazi Baba (Skopje)", "Gevgelija", "Gostivar", "Gradsko", "Ilinden", "Izvor", "Jegunovce", "Kamenjane", "Karbinci", "Karpos (Skopje)", "Kavadarci", "Kicevo", "Kisela Voda (Skopje)", "Klecevce", "Kocani", "Konce", "Kondovo", "Konopiste", "Kosel", "Kratovo", "Kriva Palanka", "Krivogastani", "Krusevo", "Kuklis", "Kukurecani", "Kumanovo", "Labunista", "Lipkovo", "Lozovo", "Lukovo", "Makedonska Kamenica", "Makedonski Brod", "Mavrovi Anovi", "Meseista", "Miravci", "Mogila", "Murtino", "Negotino", "Negotino-Poloska", "Novaci", "Novo Selo", "Oblesevo", "Ohrid", "Orasac", "Orizari", "Oslomej", "Pehcevo", "Petrovec", "Plasnia", "Podares", "Prilep", "Probistip", "Radovis", "Rankovce", "Resen", "Rosoman", "Rostusa", "Samokov", "Saraj", "Sipkovica", "Sopiste", "Sopotnika", "Srbinovo", "Star Dojran", "Staravina", "Staro Nagoricane", "Stip", "Struga", "Strumica", "Studenicani", "Suto Orizari (Skopje)", "Sveti Nikole", "Tearce", "Tetovo", "Topolcani", "Valandovo", "Vasilevo", "Veles", "Velesta", "Vevcani", "Vinica", "Vitoliste", "Vranestica", "Vrapciste", "Vratnica", "Vrutok", "Zajas", "Zelenikovo", "Zileno", "Zitose", "Zletovo", "Zrnovci"],
"MG" => ["Antananarivo", "Antsiranana", "Fianarantsoa", "Mahajanga", "Toamasina", "Toliara"],
"MW" => ["Balaka", "Blantyre", "Chikwawa", "Chiradzulu", "Chitipa", "Dedza", "Dowa", "Karonga", "Kasungu", "Likoma", "Lilongwe", "Machinga (Kasupe)", "Mangochi", "Mchinji", "Mulanje", "Mwanza", "Mzimba", "Nkhata Bay", "Nkhotakota", "Nsanje", "Ntcheu", "Ntchisi", "Phalombe", "Rumphi", "Salima", "Thyolo", "Zomba"],
"MY" => ["Johor", "Kedah", "Kelantan", "Labuan", "Melaka", "Negeri Sembilan", "Pahang", "Perak", "Perlis", "Pulau Pinang", "Sabah", "Sarawak", "Selangor", "Terengganu", "Wilayah Persekutuan"],
"MV" => ["Alifu", "Baa", "Dhaalu", "Faafu", "Gaafu Alifu", "Gaafu Dhaalu", "Gnaviyani", "Haa Alifu", "Haa Dhaalu", "Kaafu", "Laamu", "Lhaviyani", "Maale", "Meemu", "Noonu", "Raa", "Seenu", "Shaviyani", "Thaa", "Vaavu"],
"ML" => ["Gao", "Kayes", "Kidal", "Koulikoro", "Mopti", "Segou", "Sikasso", "Tombouctou"],
"MT" => ["Valletta"],
"IM" => ["Man, Isle of"],
"MH" => ["Ailinginae", "Ailinglaplap", "Ailuk", "Arno", "Aur", "Bikar", "Bikini", "Bokak", "Ebon", "Enewetak", "Erikub", "Jabat", "Jaluit", "Jemo", "Kili", "Kwajalein", "Lae", "Lib", "Likiep", "Majuro", "Maloelap", "Mejit", "Mili", "Namorik", "Namu", "Rongelap", "Rongrik", "Toke", "Ujae", "Ujelang", "Utirik", "Wotho", "Wotje"],
"MQ" => ["Martinique"],
"MR" => ["Adrar", "Assaba", "Brakna", "Dakhlet Nouadhibou", "Gorgol", "Guidimaka", "Hodh Ech Chargui", "Hodh El Gharbi", "Inchiri", "Nouakchott", "Tagant", "Tiris Zemmour", "Trarza"],
"MU" => ["Agalega Islands", "Black River", "Cargados Carajos Shoals", "Flacq", "Grand Port", "Moka", "Pamplemousses", "Plaines Wilhems", "Port Louis", "Riviere du Rempart", "Rodrigues", "Savanne"],
"YT" => ["Mayotte"],
"MX" => ["Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", "Chihuahua", "Coahuila de Zaragoza", "Colima", "Distrito Federal", "Durango", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Mexico", "Michoacan de Ocampo", "Morelos", "Nayarit", "Nuevo Leon", "Oaxaca", "Puebla", "Queretaro de Arteaga", "Quintana Roo", "San Luis Potosi", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz-Llave", "Yucatan", "Zacatecas"],
"FM" => ["Chuuk (Truk)", "Kosrae", "Pohnpei", "Yap"],
"MD" => ["Balti", "Cahul", "Chisinau", "Chisinau", "Dubasari", "Edinet", "Gagauzia", "Lapusna", "Orhei", "Soroca", "Tighina", "Ungheni"],
"MC" => ["Fontvieille", "La Condamine", "Monaco-Ville", "Monte-Carlo"],
"MN" => ["Arhangay", "Bayan-Olgiy", "Bayanhongor", "Bulgan", "Darhan", "Dornod", "Dornogovi", "Dundgovi", "Dzavhan", "Erdenet", "Govi-Altay", "Hentiy", "Hovd", "Hovsgol", "Omnogovi", "Ovorhangay", "Selenge", "Suhbaatar", "Tov", "Ulaanbaatar", "Uvs"],
"MS" => ["Saint Anthony", "Saint Georges", "Saint Peter's"],
"MA" => ["Agadir", "Al Hoceima", "Azilal", "Ben Slimane", "Beni Mellal", "Boulemane", "Casablanca", "Chaouen", "El Jadida", "El Kelaa des Srarhna", "Er Rachidia", "Essaouira", "Fes", "Figuig", "Guelmim", "Ifrane", "Kenitra", "Khemisset", "Khenifra", "Khouribga", "Laayoune", "Larache", "Marrakech", "Meknes", "Nador", "Ouarzazate", "Oujda", "Rabat-Sale", "Safi", "Settat", "Sidi Kacem", "Tan-Tan", "Tanger", "Taounate", "Taroudannt", "Tata", "Taza", "Tetouan", "Tiznit"],
"MZ" => ["Cabo Delgado", "Gaza", "Inhambane", "Manica", "Maputo", "Nampula", "Niassa", "Sofala", "Tete", "Zambezia"],
"NA" => ["Caprivi", "Erongo", "Hardap", "Karas", "Khomas", "Kunene", "Ohangwena", "Okavango", "Omaheke", "Omusati", "Oshana", "Oshikoto", "Otjozondjupa"],
"NR" => ["Aiwo", "Anabar", "Anetan", "Anibare", "Baiti", "Boe", "Buada", "Denigomodu", "Ewa", "Ijuw", "Meneng", "Nibok", "Uaboe", "Yaren"],
"NP" => ["Bagmati", "Bheri", "Dhawalagiri", "Gandaki", "Janakpur", "Karnali", "Kosi", "Lumbini", "Mahakali", "Mechi", "Narayani", "Rapti", "Sagarmatha", "Seti"],
"NL" => [["DR", "Drente"], ["FL", "Flevoland"], ["FR", "Friesland"], ["GL", "Gelderland"], ["GR", "Groningen"], ["LB", "Limburg"], ["NB", "Noord Brabant"], ["NH", "Noord Holland"], ["OV", "Overijssel"], ["UT", "Utrecht"], ["ZL", "Zeeland"], ["ZH", "Zuid Holland"]],
"AN" => ["Netherlands Antilles"],
"NC" => ["Iles Loyaute", "Nord", "Sud"],
"NZ" => ["Akaroa", "Amuri", "Ashburton", "Bay of Islands", "Bruce", "Buller", "Chatham Islands", "Cheviot", "Clifton", "Clutha", "Cook", "Dannevirke", "Egmont", "Eketahuna", "Ellesmere", "Eltham", "Eyre", "Featherston", "Franklin", "Golden Bay", "Great Barrier Island", "Grey", "Hauraki Plains", "Hawera", "Hawke's Bay", "Heathcote", "Hikurangi", "Hobson", "Hokianga", "Horowhenua", "Hurunui", "Hutt", "Inangahua", "Inglewood", "Kaikoura", "Kairanga", "Kiwitea", "Lake", "Mackenzie", "Malvern", "Manaia", "Manawatu", "Mangonui", "Maniototo", "Marlborough", "Masterton", "Matamata", "Mount Herbert", "Ohinemuri", "Opotiki", "Oroua", "Otamatea", "Otorohanga", "Oxford", "Pahiatua", "Paparua", "Patea", "Piako", "Pohangina", "Raglan", "Rangiora", "Rangitikei", "Rodney", "Rotorua", "Runanga", "Saint Kilda", "Silverpeaks", "Southland", "Stewart Island", "Stratford", "Strathallan", "Taranaki", "Taumarunui", "Taupo", "Tauranga", "Thames-Coromandel", "Tuapeka", "Vincent", "Waiapu", "Waiheke", "Waihemo", "Waikato", "Waikohu", "Waimairi", "Waimarino", "Waimate", "Waimate West", "Waimea", "Waipa", "Waipawa", "Waipukurau", "Wairarapa South", "Wairewa", "Wairoa", "Waitaki", "Waitomo", "Waitotara", "Wallace", "Wanganui", "Waverley", "Westland", "Whakatane", "Whangarei", "Whangaroa", "Woodville"],
"NI" => ["Atlantico Norte", "Atlantico Sur", "Boaco", "Carazo", "Chinandega", "Chontales", "Esteli", "Granada", "Jinotega", "Leon", "Madriz", "Managua", "Masaya", "Matagalpa", "Nueva Segovia", "Rio San Juan", "Rivas"],
"NE" => ["Agadez", "Diffa", "Dosso", "Maradi", "Niamey", "Tahoua", "Tillaberi", "Zinder"],
"NG" => ["Abia", "Abuja Federal Capital Territory", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nassarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"],
"NU" => ["Niue"],
"NF" => ["Norfolk Island"],
"MP" => ["Northern Islands", "Rota", "Saipan", "Tinian"],
"NO" => ["Akershus", "Aust-Agder", "Buskerud", "Finnmark", "Hedmark", "Hordaland", "More og Romsdal", "Nord-Trondelag", "Nordland", "Oppland", "Oslo", "Ostfold", "Rogaland", "Sogn og Fjordane", "Sor-Trondelag", "Telemark", "Troms", "Vest-Agder", "Vestfold"],
"OM" => ["Ad Dakhiliyah", "Al Batinah", "Al Wusta", "Ash Sharqiyah", "Az Zahirah", "Masqat", "Musandam", "Zufar"],
"PK" => ["Balochistan", "Federally Administered Tribal Areas", "Islamabad Capital Territory", "North-West Frontier Province", "Punjab", "Sindh"],
"PW" => ["Aimeliik", "Airai", "Angaur", "Hatobohei", "Kayangel", "Koror", "Melekeok", "Ngaraard", "Ngarchelong", "Ngardmau", "Ngatpang", "Ngchesar", "Ngeremlengui", "Ngiwal", "Palau Island", "Peleliu", "Sonsoral", "Tobi"],
"PS" => ["Palestinian Territory, Occupied"],
"PA" => ["Bocas del Toro", "Chiriqui", "Cocle", "Colon", "Darien", "Herrera", "Los Santos", "Panama", "San Blas", "Veraguas"],
"PG" => ["Bougainville", "Central", "Chimbu", "East New Britain", "East Sepik", "Eastern Highlands", "Enga", "Gulf", "Madang", "Manus", "Milne Bay", "Morobe", "National Capital", "New Ireland", "Northern", "Sandaun", "Southern Highlands", "West New Britain", "Western", "Western Highlands"],
"PY" => ["Alto Paraguay", "Alto Parana", "Amambay", "Asuncion (city)", "Boqueron", "Caaguazu", "Caazapa", "Canindeyu", "Central", "Concepcion", "Cordillera", "Guaira", "Itapua", "Misiones", "Neembucu", "Paraguari", "Presidente Hayes", "San Pedro"],
"PE" => ["Amazonas", "Ancash", "Apurimac", "Arequipa", "Ayacucho", "Cajamarca", "Callao", "Cusco", "Huancavelica", "Huanuco", "Ica", "Junin", "La Libertad", "Lambayeque", "Lima", "Loreto", "Madre de Dios", "Moquegua", "Pasco", "Piura", "Puno", "San Martin", "Tacna", "Tumbes", "Ucayali"],
"PH" => ["Abra", "Agusan del Norte", "Agusan del Sur", "Aklan", "Albay", "Angeles", "Antique", "Aurora", "Bacolod", "Bago", "Baguio", "Bais", "Basilan", "Basilan City", "Bataan", "Batanes", "Batangas", "Batangas City", "Benguet", "Bohol", "Bukidnon", "Bulacan", "Butuan", "Cabanatuan", "Cadiz", "Cagayan", "Cagayan de Oro", "Calbayog", "Caloocan", "Camarines Norte", "Camarines Sur", "Camiguin", "Canlaon", "Capiz", "Catanduanes", "Cavite", "Cavite City", "Cebu", "Cebu City", "Cotabato", "Dagupan", "Danao", "Dapitan", "Davao City Davao", "Davao del Sur", "Davao Oriental", "Dipolog", "Dumaguete", "Eastern Samar", "General Santos", "Gingoog", "Ifugao", "Iligan", "Ilocos Norte", "Ilocos Sur", "Iloilo", "Iloilo City", "Iriga", "Isabela", "Kalinga-Apayao", "La Carlota", "La Union", "Laguna", "Lanao del Norte", "Lanao del Sur", "Laoag", "Lapu-Lapu", "Legaspi", "Leyte", "Lipa", "Lucena", "Maguindanao", "Mandaue", "Manila", "Marawi", "Marinduque", "Masbate", "Mindoro Occidental", "Mindoro Oriental", "Misamis Occidental", "Misamis Oriental", "Mountain", "Naga", "Negros Occidental", "Negros Oriental", "North Cotabato", "Northern Samar", "Nueva Ecija", "Nueva Vizcaya", "Olongapo", "Ormoc", "Oroquieta", "Ozamis", "Pagadian", "Palawan", "Palayan", "Pampanga", "Pangasinan", "Pasay", "Puerto Princesa", "Quezon", "Quezon City", "Quirino", "Rizal", "Romblon", "Roxas", "Samar", "San Carlos (in Negros Occidental)", "San Carlos (in Pangasinan)", "San Jose", "San Pablo", "Silay", "Siquijor", "Sorsogon", "South Cotabato", "Southern Leyte", "Sultan Kudarat", "Sulu", "Surigao", "Surigao del Norte", "Surigao del Sur", "Tacloban", "Tagaytay", "Tagbilaran", "Tangub", "Tarlac", "Tawitawi", "Toledo", "Trece Martires", "Zambales", "Zamboanga", "Zamboanga del Norte", "Zamboanga del Sur"],
"PN" => ["Pitcairn Islands"],
"PL" => ["Dolnoslaskie", "Kujawsko-Pomorskie", "Lodzkie", "Lubelskie", "Lubuskie", "Malopolskie", "Mazowieckie", "Opolskie", "Podkarpackie", "Podlaskie", "Pomorskie", "Slaskie", "Swietokrzyskie", "Warminsko-Mazurskie", "Wielkopolskie", "Zachodniopomorskie"],
"PT" => ["Acores (Azores)", "Aveiro", "Beja", "Braga", "Braganca", "Castelo Branco", "Coimbra", "Evora", "Faro", "Guarda", "Leiria", "Lisboa", "Madeira", "Portalegre", "Porto", "Santarem", "Setubal", "Viana do Castelo", "Vila Real", "Viseu"],
"PR" => ["Adjuntas", "Aguada", "Aguadilla", "Aguas Buenas", "Aibonito", "Anasco", "Arecibo", "Arroyo", "Barceloneta", "Barranquitas", "Bayamon", "Cabo Rojo", "Caguas", "Camuy", "Canovanas", "Carolina", "Catano", "Cayey", "Ceiba", "Ciales", "Cidra", "Coamo", "Comerio", "Corozal", "Culebra", "Dorado", "Fajardo", "Florida", "Guanica", "Guayama", "Guayanilla", "Guaynabo", "Gurabo", "Hatillo", "Hormigueros", "Humacao", "Isabela", "Jayuya", "Juana Diaz", "Juncos", "Lajas", "Lares", "Las Marias", "Las Piedras", "Loiza", "Luquillo", "Manati", "Maricao", "Maunabo", "Mayaguez", "Moca", "Morovis", "Naguabo", "Naranjito", "Orocovis", "Patillas", "Penuelas", "Ponce", "Quebradillas", "Rincon", "Rio Grande", "Sabana Grande", "Salinas", "San German", "San Juan", "San Lorenzo", "San Sebastian", "Santa Isabel", "Toa Alta", "Toa Baja", "Trujillo Alto", "Utuado", "Vega Alta", "Vega Baja", "Vieques", "Villalba", "Yabucoa", "Yauco"],
"QA" => ["Ad Dawhah", "Al Ghuwayriyah", "Al Jumayliyah", "Al Khawr", "Al Wakrah", "Ar Rayyan", "Jarayan al Batinah", "Madinat ash Shamal", "Umm Salal"],
"RE" => ["Reunion"],
"RO" => ["Alba", "Arad", "Arges", "Bacau", "Bihor", "Bistrita-Nasaud", "Botosani", "Braila", "Brasov", "Bucuresti", "Buzau", "Calarasi", "Caras-Severin", "Cluj", "Constanta", "Covasna", "Dimbovita", "Dolj", "Galati", "Giurgiu", "Gorj", "Harghita", "Hunedoara", "Ialomita", "Iasi", "Maramures", "Mehedinti", "Mures", "Neamt", "Olt", "Prahova", "Salaj", "Satu Mare", "Sibiu", "Suceava", "Teleorman", "Timis", "Tulcea", "Vaslui", "Vilcea", "Vrancea"],
"RU" => ["Adygeya (Maykop)", "Aginskiy Buryatskiy (Aginskoye)", "Altay (Gorno-Altaysk)", "Altayskiy (Barnaul)", "Amurskaya (Blagoveshchensk)", "Arkhangel'skaya", "Astrakhanskaya", "Bashkortostan (Ufa)", "Belgorodskaya", "Bryanskaya", "Buryatiya (Ulan-Ude)", "Chechnya (Groznyy)", "Chelyabinskaya", "Chitinskaya", "Chukotskiy (Anadyr')", "Chuvashiya (Cheboksary)", "Dagestan (Makhachkala)", "Evenkiyskiy (Tura)", "Ingushetiya (Nazran')", "Irkutskaya", "Ivanovskaya", "Kabardino-Balkariya (Nal'chik)", "Kaliningradskaya", "Kalmykiya (Elista)", "Kaluzhskaya", "Kamchatskaya (Petropavlovsk-Kamchatskiy)", "Karachayevo-Cherkesiya (Cherkessk)", "Kareliya (Petrozavodsk)", "Kemerovskaya", "Khabarovskiy", "Khakasiya (Abakan)", "Khanty-Mansiyskiy (Khanty-Mansiysk)", "Kirovskaya", "Komi (Syktyvkar)", "Komi-Permyatskiy (Kudymkar)", "Koryakskiy (Palana)", "Kostromskaya", "Krasnodarskiy", "Krasnoyarskiy", "Kurganskaya", "Kurskaya", "Leningradskaya", "Lipetskaya", "Magadanskaya", "Mariy-El (Yoshkar-Ola)", "Mordoviya (Saransk)", "Moskovskaya", "Moskva (Moscow)", "Murmanskaya", "Nenetskiy (Nar'yan-Mar)", "Nizhegorodskaya", "Novgorodskaya", "Novosibirskaya", "Omskaya", "Orenburgskaya", "Orlovskaya (Orel)", "Penzenskaya", "Permskaya", "Primorskiy (Vladivostok)", "Pskovskaya", "Rostovskaya", "Ryazanskaya", "Sakha (Yakutsk)", "Sakhalinskaya (Yuzhno-Sakhalinsk)", "Samarskaya", "Sankt-Peterburg (Saint Petersburg)", "Saratovskaya", "Severnaya Osetiya-Alaniya [North Ossetia] (Vladikavkaz)", "Smolenskaya", "Stavropol'skiy", "Sverdlovskaya (Yekaterinburg)", "Tambovskaya", "Tatarstan (Kazan')", "Taymyrskiy (Dudinka)", "Tomskaya", "Tul'skaya", "Tverskaya", "Tyumenskaya", "Tyva (Kyzyl)", "Udmurtiya (Izhevsk)", "Ul'yanovskaya", "Ust'-Ordynskiy Buryatskiy (Ust'-Ordynskiy)", "Vladimirskaya", "Volgogradskaya", "Vologodskaya", "Voronezhskaya", "Yamalo-Nenetskiy (Salekhard)", "Yaroslavskaya", "Yevreyskaya"],
"RW" => ["Butare", "Byumba", "Cyangugu", "Gikongoro", "Gisenyi", "Gitarama", "Kibungo", "Kibuye", "Kigali Rurale", "Kigali-ville", "Ruhengeri", "Umutara"],
"SH" => ["Ascension", "Saint Helena", "Tristan da Cunha"],
"KN" => ["Christ Church Nichola Town", "Saint Anne Sandy Point", "Saint George Basseterre", "Saint George Gingerland", "Saint James Windward", "Saint John Capisterre", "Saint John Figtree", "Saint Mary Cayon", "Saint Paul Capisterre", "Saint Paul Charlestown", "Saint Peter Basseterre", "Saint Thomas Lowland", "Saint Thomas Middle Island", "Trinity Palmetto Point"],
"LC" => ["Anse-la-Raye", "Castries", "Choiseul", "Dauphin", "Dennery", "Gros Islet", "Laborie", "Micoud", "Praslin", "Soufriere", "Vieux Fort"],
"PM" => ["Miquelon", "Saint Pierre"],
"VC" => ["Charlotte", "Grenadines", "Saint Andrew", "Saint David", "Saint George", "Saint Patrick"],
"WS" => ["A'ana", "Aiga-i-le-Tai", "Atua", "Fa'asaleleaga", "Gaga'emauga", "Gagaifomauga", "Palauli", "Satupa'itea", "Tuamasaga", "Va'a-o-Fonoti", "Vaisigano"],
"SM" => ["Acquaviva", "Borgo Maggiore", "Chiesanuova", "Domagnano", "Faetano", "Fiorentino", "Monte Giardino", "San Marino", "Serravalle"],
"ST" => ["Principe", "Sao Tome"],
"SA" => ["'Asir", "Al Bahah", "Al Hudud ash Shamaliyah", "Al Jawf", "Al Madinah", "Al Qasim", "Ar Riyad", "Ash Sharqiyah (Eastern Province)", "Ha'il", "Jizan", "Makkah", "Najran", "Tabuk"],
"SN" => ["Dakar", "Diourbel", "Fatick", "Kaolack", "Kolda", "Louga", "Saint-Louis", "Tambacounda", "Thies", "Ziguinchor"],
"RS" => ["Serbia"],
"SC" => ["Anse aux Pins", "Anse Boileau", "Anse Etoile", "Anse Louis", "Anse Royale", "Baie Lazare", "Baie Sainte Anne", "Beau Vallon", "Bel Air", "Bel Ombre", "Cascade", "Glacis", "Grand' Anse (on Mahe)", "Grand' Anse (on Praslin)", "La Digue", "La Riviere Anglaise", "Mont Buxton", "Mont Fleuri", "Plaisance", "Pointe La Rue", "Port Glaud", "Saint Louis", "Takamaka"],
"SL" => ["Eastern", "Northern", "Southern", "Western"],
"SG" => ["Singapore"],
"SK" => ["Banskobystricky", "Bratislavsky", "Kosicky", "Nitriansky", "Presovsky", "Trenciansky", "Trnavsky", "Zilinsky"],
"SI" => ["Ajdovscina", "Beltinci", "Bled", "Bohinj", "Borovnica", "Bovec", "Brda", "Brezice", "Brezovica", "Cankova-Tisina", "Celje", "Cerklje na Gorenjskem", "Cerknica", "Cerkno", "Crensovci", "Crna na Koroskem", "Crnomelj", "Destrnik-Trnovska Vas", "Divaca", "Dobrepolje", "Dobrova-Horjul-Polhov Gradec", "Dol pri Ljubljani", "Domzale", "Dornava", "Dravograd", "Duplek", "Gorenja Vas-Poljane", "Gorisnica", "Gornja Radgona", "Gornji Grad", "Gornji Petrovci", "Grosuplje", "Hodos Salovci", "Hrastnik", "Hrpelje-Kozina", "Idrija", "Ig", "Ilirska Bistrica", "Ivancna Gorica", "Izola", "Jesenice", "Jursinci", "Kamnik", "Kanal", "Kidricevo", "Kobarid", "Kobilje", "Kocevje", "Komen", "Koper", "Kozje", "Kranj", "Kranjska Gora", "Krsko", "Kungota", "Kuzma", "Lasko", "Lenart", "Lendava", "Litija", "Ljubljana", "Ljubno", "Ljutomer", "Logatec", "Loska Dolina", "Loski Potok", "Luce", "Lukovica", "Majsperk", "Maribor", "Medvode", "Menges", "Metlika", "Mezica", "Miren-Kostanjevica", "Mislinja", "Moravce", "Moravske Toplice", "Mozirje", "Murska Sobota", "Muta", "Naklo", "Nazarje", "Nova Gorica", "Novo Mesto", "Odranci", "Ormoz", "Osilnica", "Pesnica", "Piran", "Pivka", "Podcetrtek", "Podvelka-Ribnica", "Postojna", "Preddvor", "Ptuj", "Puconci", "Race-Fram", "Radece", "Radenci", "Radlje ob Dravi", "Radovljica", "Ravne-Prevalje", "Ribnica", "Rogasevci", "Rogaska Slatina", "Rogatec", "Ruse", "Semic", "Sencur", "Sentilj", "Sentjernej", "Sentjur pri Celju", "Sevnica", "Sezana", "Skocjan", "Skofja Loka", "Skofljica", "Slovenj Gradec", "Slovenska Bistrica", "Slovenske Konjice", "Smarje pri Jelsah", "Smartno ob Paki", "Sostanj", "Starse", "Store", "Sveti Jurij", "Tolmin", "Trbovlje", "Trebnje", "Trzic", "Turnisce", "Velenje", "Velike Lasce", "Videm", "Vipava", "Vitanje", "Vodice", "Vojnik", "Vrhnika", "Vuzenica", "Zagorje ob Savi", "Zalec", "Zavrc", "Zelezniki", "Ziri", "Zrece"],
"SB" => ["Bellona", "Central", "Choiseul (Lauru)", "Guadalcanal", "Honiara", "Isabel", "Makira", "Malaita", "Rennell", "Temotu", "Western"],
"SO" => ["Awdal", "Bakool", "Banaadir", "Bari", "Bay", "Galguduud", "Gedo", "Hiiraan", "Jubbada Dhexe", "Jubbada Hoose", "Mudug", "Nugaal", "Sanaag", "Shabeellaha Dhexe", "Shabeellaha Hoose", "Sool", "Togdheer", "Woqooyi Galbeed"],
"ZA" => ["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Mpumalanga", "North-West", "Northern Cape", "Northern Province", "Western Cape"],
"GS" => ["Bird Island", "Bristol Island", "Clerke Rocks", "Montagu Island", "Saunders Island", "South Georgia", "Southern Thule", "Traversay Islands"],
"SS" => ["South Sudan"],
"ES" => ["Andalucia", "Aragon", "Asturias", "Baleares (Balearic Islands)", "Canarias (Canary Islands)", "Cantabria", "Castilla y Leon", "Castilla-La Mancha", "Cataluna", "Ceuta", "Communidad Valencian", "Extremadura", "Galicia", "Islas Chafarinas", "La Rioja", "Madrid", "Melilla", "Murcia", "Navarra", "Pais Vasco (Basque Country)", "Penon de Alhucemas", "Penon de Velez de la Gomera"],
"LK" => ["Central", "Eastern", "North Central", "North Eastern", "North Western", "Northern", "Sabaragamuwa", "Southern", "Uva", "Western"],
"SD" => ["A'ali an Nil", "Al Bahr al Ahmar", "Al Buhayrat", "Al Jazirah", "Al Khartum", "Al Qadarif", "Al Wahdah", "An Nil al Abyad", "An Nil al Azraq", "Ash Shamaliyah", "Bahr al Jabal", "Gharb al Istiwa'iyah", "Gharb Bahr al Ghazal", "Gharb Darfur", "Gharb Kurdufan", "Janub Darfur", "Janub Kurdufan", "Junqali", "Kassala", "Nahr an Nil", "Shamal Bahr al Ghazal", "Shamal Darfur", "Shamal Kurdufan", "Sharq al Istiwa'iyah", "Sinnar", "Warab"],
"SR" => ["Brokopondo", "Commewijne", "Coronie", "Marowijne", "Nickerie", "Para", "Paramaribo", "Saramacca", "Sipaliwini", "Wanica"],
"SJ" => ["Barentsoya", "Bjornoya", "Edgeoya", "Hopen", "Kvitoya", "Nordaustandet", "Prins Karls Forland", "Spitsbergen"],
"SZ" => ["Hhohho", "Lubombo", "Manzini", "Shiselweni"],
"SE" => ["Blekinge", "Dalarnas", "Gavleborgs", "Gotlands", "Hallands", "Jamtlands", "Jonkopings", "Kalmar", "Kronobergs", "Norrbottens", "Orebro", "Ostergotlands", "Skane", "Sodermanlands", "Stockholms", "Uppsala", "Varmlands", "Vasterbottens", "Vasternorrlands", "Vastmanlands", "Vastra Gotalands"],
"CH" => ["Aargau", "Ausser-Rhoden", "Basel-Landschaft", "Basel-Stadt", "Bern", "Fribourg", "Geneve", "Glarus", "Graubunden", "Inner-Rhoden", "Jura", "Luzern", "Neuchatel", "Nidwalden", "Obwalden", "Sankt Gallen", "Schaffhausen", "Schwyz", "Solothurn", "Thurgau", "Ticino", "Uri", "Valais", "Vaud", "Zug", "Zurich"],
"SY" => ["Al Hasakah", "Al Ladhiqiyah", "Al Qunaytirah", "Ar Raqqah", "As Suwayda'", "Dar'a", "Dayr az Zawr", "Dimashq", "Halab", "Hamah", "Hims", "Idlib", "Rif Dimashq", "Tartus"],
"TW" => ["Chang-hua", "Chi-lung", "Chia-i", "Chia-i", "Chung-hsing-hsin-ts'un", "Hsin-chu", "Hsin-chu", "Hua-lien", "I-lan", "Kao-hsiung", "Kao-hsiung", "Miao-li", "Nan-t'ou", "P'eng-hu", "P'ing-tung", "T'ai-chung", "T'ai-chung", "T'ai-nan", "T'ai-nan", "T'ai-pei", "T'ai-pei", "T'ai-tung", "T'ao-yuan", "Yun-lin"],
"TJ" => ["Viloyati Khatlon", "Viloyati Leninobod", "Viloyati Mukhtori Kuhistoni Badakhshon"],
"TZ" => ["Arusha", "Dar es Salaam", "Dodoma", "Iringa", "Kagera", "Kigoma", "Kilimanjaro", "Lindi", "Mara", "Mbeya", "Morogoro", "Mtwara", "Mwanza", "Pemba North", "Pemba South", "Pwani", "Rukwa", "Ruvuma", "Shinyanga", "Singida", "Tabora", "Tanga", "Zanzibar Central/South", "Zanzibar North", "Zanzibar Urban/West"],
"TH" => ["Amnat Charoen", "Ang Thong", "Buriram", "Chachoengsao", "Chai Nat", "Chaiyaphum", "Chanthaburi", "Chiang Mai", "Chiang Rai", "Chon Buri", "Chumphon", "Kalasin", "Kamphaeng Phet", "Kanchanaburi", "Khon Kaen", "Krabi", "Krung Thep Mahanakhon (Bangkok)", "Lampang", "Lamphun", "Loei", "Lop Buri", "Mae Hong Son", "Maha Sarakham", "Mukdahan", "Nakhon Nayok", "Nakhon Pathom", "Nakhon Phanom", "Nakhon Ratchasima", "Nakhon Sawan", "Nakhon Si Thammarat", "Nan", "Narathiwat", "Nong Bua Lamphu", "Nong Khai", "Nonthaburi", "Pathum Thani", "Pattani", "Phangnga", "Phatthalung", "Phayao", "Phetchabun", "Phetchaburi", "Phichit", "Phitsanulok", "Phra Nakhon Si Ayutthaya", "Phrae", "Phuket", "Prachin Buri", "Prachuap Khiri Khan", "Ranong", "Ratchaburi", "Rayong", "Roi Et", "Sa Kaeo", "Sakon Nakhon", "Samut Prakan", "Samut Sakhon", "Samut Songkhram", "Sara Buri", "Satun", "Sing Buri", "Sisaket", "Songkhla", "Sukhothai", "Suphan Buri", "Surat Thani", "Surin", "Tak", "Trang", "Trat", "Ubon Ratchathani", "Udon Thani", "Uthai Thani", "Uttaradit", "Yala", "Yasothon"],
"TG" => ["De La Kara", "Des Plateaux", "Des Savanes", "Du Centre", "Maritime"],
"TK" => ["Atafu", "Fakaofo", "Nukunonu"],
"TO" => ["Ha'apai", "Tongatapu", "Vava'u"],
"TT" => ["Arima", "Caroni", "Mayaro", "Nariva", "Port-of-Spain", "Saint Andrew", "Saint David", "Saint George", "Saint Patrick", "San Fernando", "Victoria"],
"TN" => ["Ariana", "Beja", "Ben Arous", "Bizerte", "El Kef", "Gabes", "Gafsa", "Jendouba", "Kairouan", "Kasserine", "Kebili", "Mahdia", "Medenine", "Monastir", "Nabeul", "Sfax", "Sidi Bou Zid", "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"],
"TR" => ["Adana", "Adiyaman", "Afyon", "Agri", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin", "Aydin", "Balikesir", "Bartin", "Batman", "Bayburt", "Bilecik", "Bingol", "Bitlis", "Bolu", "Burdur", "Bursa", "Canakkale", "Cankiri", "Corum", "Denizli", "Diyarbakir", "Duzce", "Edirne", "Elazig", "Erzincan", "Erzurum", "Eskisehir", "Gaziantep", "Giresun", "Gumushane", "Hakkari", "Hatay", "Icel", "Igdir", "Isparta", "Istanbul", "Izmir", "Kahramanmaras", "Karabuk", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kilis", "Kirikkale", "Kirklareli", "Kirsehir", "Kocaeli", "Konya", "Kutahya", "Malatya", "Manisa", "Mardin", "Mugla", "Mus", "Nevsehir", "Nigde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Sanliurfa", "Siirt", "Sinop", "Sirnak", "Sivas", "Tekirdag", "Tokat", "Trabzon", "Tunceli", "Usak", "Van", "Yalova", "Yozgat", "Zonguldak"],
"TM" => ["Ahal Welayaty", "Balkan Welayaty", "Dashhowuz Welayaty", "Lebap Welayaty", "Mary Welayaty"],
"TC" => ["Turks and Caicos Islands"],
"TV" => ["Tuvalu"],
"UG" => ["Adjumani", "Apac", "Arua", "Bugiri", "Bundibugyo", "Bushenyi", "Busia", "Gulu", "Hoima", "Iganga", "Jinja", "Kabale", "Kabarole", "Kalangala", "Kampala", "Kamuli", "Kapchorwa", "Kasese", "Katakwi", "Kibale", "Kiboga", "Kisoro", "Kitgum", "Kotido", "Kumi", "Lira", "Luwero", "Masaka", "Masindi", "Mbale", "Mbarara", "Moroto", "Moyo", "Mpigi", "Mubende", "Mukono", "Nakasongola", "Nebbi", "Ntungamo", "Pallisa", "Rakai", "Rukungiri", "Sembabule", "Soroti", "Tororo"],
"UA" => ["Avtonomna Respublika Krym (Simferopol')", "Cherkas'ka (Cherkasy)", "Chernihivs'ka (Chernihiv)", "Chernivets'ka (Chernivtsi)", "Dnipropetrovs'ka (Dnipropetrovs'k)", "Donets'ka (Donets'k)", "Ivano-Frankivs'ka (Ivano-Frankivs'k)", "Kharkivs'ka (Kharkiv)", "Khersons'ka (Kherson)", "Khmel'nyts'ka (Khmel'nyts'kyy)", "Kirovohrads'ka (Kirovohrad)", "Kyyiv", "Kyyivs'ka (Kiev)", "L'vivs'ka (L'viv)", "Luhans'ka (Luhans'k)", "Mykolayivs'ka (Mykolayiv)", "Odes'ka (Odesa)", "Poltavs'ka (Poltava)", "Rivnens'ka (Rivne)", "Sevastopol'", "Sums'ka (Sumy)", "Ternopil's'ka (Ternopil')", "Vinnyts'ka (Vinnytsya)", "Volyns'ka (Luts'k)", "Zakarpats'ka (Uzhhorod)", "Zaporiz'ka (Zaporizhzhya)", "Zhytomyrs'ka (Zhytomyr)"],
"AE" => ["'Ajman", "Abu Zaby (Abu Dhabi)", "Al Fujayrah", "Ash Shariqah (Sharjah)", "Dubayy (Dubai)", "Ra's al Khaymah", "Umm al Qaywayn"],
"UK" => { "England" => ["Avon", "Bedfordshire", "Berkshire", "Buckinghamshire", "Cambridgeshire", "Cheshire", "Cleveland", "Cornwall", "Cumbria", "Derbyshire", "Devon", "Dorset", "Durham", "East Sussex", "Essex", "Gloucestershire", "Hampshire", "Herefordshire", "Hertfordshire", "Isle of Wight", "Kent", "Lancashire", "Leicestershire", "Lincolnshire", "London", "Merseyside", "Middlesex", "Norfolk", "Northamptonshire", "Northumberland", "North Humberside", "North Yorkshire", "Nottinghamshire", "Oxfordshire", "Rutland", "Shropshire", "Somerset", "South Humberside", "South Yorkshire", "Staffordshire", "Suffolk", "Surrey", "Tyne and Wear", "Warwickshire", "West Midlands", "West Sussex", "West Yorkshire", "Wiltshire", "Worcestershire"], "Wales" => ["Clwyd", "Dyfed", "Gwent", "Gwynedd", "Mid Glamorgan", "Powys", "South Glamorgan", "West Glamorgan"], "Scotland" => ["Aberdeenshire", "Angus", "Argyll", "Ayrshire", "Banffshire", "Berwickshire", "Bute", "Caithness", "Clackmannanshire", "Dumfriesshire", "Dunbartonshire", "East Lothian", "Fife", "Inverness-shire", "Kincardineshire", "Kinross-shire", "Kirkcudbrightshire", "Lanarkshire", "Midlothian", "Moray", "Nairnshire", "Orkney", "Peeblesshire", "Perthshire", "Renfrewshire", "Ross-shire", "Roxburghshire", "Selkirkshire", "Shetland", "Stirlingshire", "Sutherland", "West Lothian", "Wigtownshire"], "Northern_Ireland" => ["Antrim", "Armagh", "Down", "Fermanagh", "Londonderry", "Tyrone"] },
"US" => [["AK", "Alaska"], ["AL", "Alabama"], ["AR", "Arkansas"], ["AZ", "Arizona"], ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"], ["District of Columbia", "D.C."], ["DE", "Delaware"], ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"], ["IA", "Iowa"], ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"], ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["MA", "Massachusetts"], ["MD", "Maryland"], ["ME", "Maine"], ["MI", "Michigan"], ["MN", "Minnesota"], ["MO", "Missouri"], ["MS", "Mississippi"], ["MT", "Montana"], ["NC", "North Carolina"], ["ND", "North Dakota"], ["NE", "Nebraska"], ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"], ["NV", "Nevada"], ["NY", "New York"], ["OH", "Ohio"], ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["PR", "Puerto Rico"], ["RI", "Rhode Island"], ["SC", "South Carolina"], ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"], ["VA", "Virginia"], ["VI", "Virgin Islands"], ["VT", "Vermont"], ["WA", "Washington"], ["WI", "Wisconsin"], ["WV", "West Virginia"], ["WY", "Wyoming"], ["AS", "American Samoa"], ["GU", "Guam"], ["MP", "Marianas"], ["MH", "Marshall Islands"], ["FM", "Micronesia"], ["AA", "Military Americas"], ["AE", "Military Europe/ME/Canada"], ["AP", "Military Pacific"], ["PW", "Palau"]],
"UM" => ["Baker Island", "Howland Island", "Kingman Reef", "Midway Islands", "Navassa Island", "Palmyra Atoll", "Wake Island"],
"UY" => ["Artigas", "Canelones", "Cerro Largo", "Colonia", "Durazno", "Flores", "Florida", "Lavalleja", "Maldonado", "Montevideo", "Paysandu", "Rio Negro", "Rivera", "Rocha", "Salto", "San Jose", "Soriano", "Tacuarembo", "Treinta y Tres"],
"UZ" => ["Andijon Wiloyati", "Bukhoro Wiloyati", "Farghona Wiloyati", "Jizzakh Wiloyati", "Khorazm Wiloyati (Urganch)", "Namangan Wiloyati", "Nawoiy Wiloyati", "Qashqadaryo Wiloyati (Qarshi)", "Qoraqalpoghiston (Nukus)", "Samarqand Wiloyati", "Sirdaryo Wiloyati (Guliston)", "Surkhondaryo Wiloyati (Termiz)", "Toshkent Shahri", "Toshkent Wiloyati"],
"VU" => ["Malampa", "Penama", "Sanma", "Shefa", "Tafea", "Torba"],
"VE" => ["Amazonas", "Anzoategui", "Apure", "Aragua", "Barinas", "Bolivar", "Carabobo", "Cojedes", "Delta Amacuro", "Dependencias Federales", "Distrito Federal", "Falcon", "Guarico", "Lara", "Merida", "Miranda", "Monagas", "Nueva Esparta", "Portuguesa", "Sucre", "Tachira", "Trujillo", "Vargas", "Yaracuy", "Zulia"],
"VN" => ["An Giang", "Ba Ria-Vung Tau", "Bac Giang", "Bac Kan", "Bac Lieu", "Bac Ninh", "Ben Tre", "Binh Dinh", "Binh Duong", "Binh Phuoc", "Binh Thuan", "Ca Mau", "Can Tho", "Cao Bang", "Da Nang", "Dac Lak", "Dong Nai", "Dong Thap", "Gia Lai", "Ha Giang", "Ha Nam", "Ha Noi", "Ha Tay", "Ha Tinh", "Hai Duong", "Hai Phong", "Ho Chi Minh", "Hoa Binh", "Hung Yen", "Khanh Hoa", "Kien Giang", "Kon Tum", "Lai Chau", "Lam Dong", "Lang Son", "Lao Cai", "Long An", "Nam Dinh", "Nghe An", "Ninh Binh", "Ninh Thuan", "Phu Tho", "Phu Yen", "Quang Binh", "Quang Nam", "Quang Ngai", "Quang Ninh", "Quang Tri", "Soc Trang", "Son La", "Tay Ninh", "Thai Binh", "Thai Nguyen", "Thanh Hoa", "Thua Thien-Hue", "Tien Giang", "Tra Vinh", "Tuyen Quang", "Vinh Long", "Vinh Phuc", "Yen Bai"],
"VI" => ["Saint Croix", "Saint John", "Saint Thomas"],
"WF" => ["Alo", "Sigave", "Wallis"],
"WE" => ["West Bank"],
"EH" => ["Western Sahara"],
"YE" => ["'Adan", "'Ataq", "Abyan", "Al Bayda'", "Al Hudaydah", "Al Jawf", "Al Mahrah", "Al Mahwit", "Dhamar", "Hadhramawt", "Hajjah", "Ibb", "Lahij", "Ma'rib", "Sa'dah", "San'a'", "Ta'izz"],
"YU" => ["Kosovo", "Montenegro", "Serbia", "Vojvodina"],
"ZM" => ["Central", "Copperbelt", "Eastern", "Luapula", "Lusaka", "North-Western", "Northern", "Southern", "Western"],
"ZW" => ["Bulawayo", "Harare", "ManicalandMashonaland Central", "Mashonaland East", "Mashonaland West", "Masvingo", "Matabeleland North", "Matabeleland South", "Midlands"]
);


%def = (

    'states_path' => '',

    # Edit or add languages to translate between using two letter designation
    'translate_lang' => \@avail_langs,

    # ==========================================
	# The following variables don't need to be changed
    # ==========================================
    'script_url'    => $q->url,

	'cntr_txt' => {

		'message5'		=>  'Perl Information',
		'message6'		=>  'Perl Exe',
		'message7'		=>  'Perl Version',
		'message8'		=>  'CGI.pm Version',

		'script_mes1'	=>  'Script is OK.',
		'script_mes2'	=>  'This script requires several inputs to function fully.',

		'states_folder'	=>  'Creating states dir failed!',
        'states_failed' =>  'Writing state file failed!',
        'states_success'=>  'State file(s) written successfully:',

		'trans_folder'	=>  'Creating dir failed!',
        'trans_lang_na' =>  'Translation language not recognized.',
        'trans_modu_na' =>  'Translation module name not recognized.',
        'trans_text_na' =>  'Translation text was not valid.'
	}
);

# -- Add all our external config variables
foreach (keys %$MSOS::Base::defined) { $def{$_} = $MSOS::Base::defined->{$_}; }

# -- Add this script's details (default is MSOS::Base)
$def{'script_info'} = {
	'name'			=> $script_name,
	'revision_date'	=> $script_date,
	'version'		=> $script_vers,
	'year'			=> $copyright_year,
};

# -- Set Debug on/off
$def{'debug'} = $q->param('debug') || '';

# -- Set states base path
$def{'states_path'} = $def{'site_base_dir'} . $def{'msos_states_folder'};


#  Translation write file logic
# ===========================
$def{'results_list'} = $def{'cntr_txt'}{'states_failed'};

$def{'translation_lang'} = $q->param('translate_lang') || '';
$def{'translation_ctry'} = $q->param('translate_country') || '';
$def{'translation_text'} = $q->param('json_text') || '';
$def{'translation_set'}  = $q->param('set_new_base') || '';

my $lang_array_ref = $def{'translate_lang'};
my $flag_trans = 0;

foreach my $lang (@$lang_array_ref) { if ($lang eq $def{'translation_lang'}) { $flag_trans = 1; last; } }

if ($flag_trans) {
        if ($state_by_country{$def{'translation_ctry'}}) {
            if (($def{'translation_text'} =~ m/^[{].+/) && ($def{'translation_text'} =~ m/[}]$/)) {
                    &write_json_file(\%def);
            } else  { $def{'results_list'} .= '<br />' . $def{'cntr_txt'}{'trans_text_na'}; }
        } else		{ $def{'results_list'} .= '<br />' . $def{'cntr_txt'}{'trans_modu_na'}; }
} else				{ $def{'results_list'} .= '<br />' . $def{'cntr_txt'}{'trans_lang_na'}; }


#  Initiate Country-States (default is above -> english - in location '/msos/states')
# ===========================
$def{'initiate_states'} = $q->param('initiate_states') || '';

if ($def{'initiate_states'} eq 'yes') {

    $def{'results_list'} = $def{'cntr_txt'}{'states_success'} . "<br />\n";

    foreach (keys %state_by_country) {
		write_initial_json_country_state_files(\%def, $_, $state_by_country{$_});
    }
}

# -- Debugging and tests
if ($def{'debug'}) {
	&MSOS::Base::run_debugging( $q, \%def );
}


#  Script Output Section
# ===========================

binmode(STDOUT, ":utf8");

print $q->header(

	-type => $def{'content_type'},
	-expires => 'now',
	-last_modified	=> scalar(gmtime)
);

if		($def{'translation_ctry'}
	  && $def{'translation_lang'}
	  && $def{'translation_text'})	{    &print_body($q, \%def); }
elsif	($def{'initiate_states'})	{    &print_body($q, \%def); }
else								{ &print_default($q, \%def); }


#  End of Script
# =========================================================



#  SUBROUTINES
# =========================================================


sub print_body {
# -----------------------------

	my $r = shift;
	my $dref = shift;

	print "\t<section>\n<h2>$dref->{'script_info'}->{'name'} v$dref->{'script_info'}->{'version'}</h2>\n";
	print "<h2>$dref->{'results_list'}</h2>\n";

	if ($r->param('translate_country'))	{ print "<h3>Country: "	. $r->param('translate_country')	. ".js</h3>\n"; }
	if ($r->param('translate_from'))	{ print "<h3>From: "	. $r->param('translate_from')		. "</h3>\n";    }
	if ($r->param('translate_to'))		{ print "<h3>To: "		. $r->param('translate_to')			. "</h3>\n";    }

	print "<table class='table table-bordered table-striped table-wordbreak'>\n";
	print "<tr><th colspan='3'>$dref->{'cntr_txt'}->{'message5'}</th></tr>\n";
	print "<tr><td>$dref->{'cntr_txt'}->{'message6'}</td><td colspan='2'>$^X</td></tr>\n";
	print "<tr><td>$dref->{'cntr_txt'}->{'message7'}</td><td colspan='2'>$]</td></tr>\n";
	print "<tr><td>$dref->{'cntr_txt'}->{'message8'}</td><td colspan='2'>$CGI::VERSION</td></tr>\n";
	print "</table>\t</section>\n";
}

sub print_default {
# -----------------------------

	my $r = shift;
	my $dref = shift;

	print "\t<section>\n<h2>$dref->{'script_info'}->{'name'} v$dref->{'script_info'}->{'version'}</h2>\n";

	print "\t\t<h3>$dref->{'cntr_txt'}->{'script_mes1'}</h3>\n";
	print "\t\t<div id='status'><span class='alert'>$dref->{'cntr_txt'}->{'script_mes2'}</span></div>\n";
	print "\t</section>\n";
}

sub write_initial_json_country_state_files {
# -----------------------------

	my $dref = shift;
	my $country_code = shift;
	my $state_object = shift;
	my $state_json = '';
	my $fh = &MSOS::Base::gen_filehandle();
	my $folder = '';
	my $path = '';

    $folder = $dref->{'states_path'};
    $path = $folder . '/' . $country_code . '.json';

    unless(-d $folder) {
		mkdir($folder, 0755) or &MSOS::Base::handle_errors( "Intiate Country States JSON Files - " . $dref->{'cntr_txt'}->{'states_folder'} . "<br />$folder<br />$!", 'yes' );
    }

    unless(-e $path) {

		$state_json = to_json($state_object, { utf8 => 1 });

		$dref->{'results_list'} .= '<br />' . $country_code . ".json\n";

		&MSOS::Base::open_write_file(
			$fh,
			$path,
			'write_json_file -> ' . $dref->{'cntr_txt'}->{'states_failed'},
			$state_json
		);
    }
}

sub write_json_file {
# -----------------------------

	my $dref = shift;
	my $fh = &MSOS::Base::gen_filehandle();
	my $folder = '';
	my $path = '';


	my $lang_code = lc($dref->{'translation_lang'});

	$folder = $dref->{'states_path'} . '/' . $lang_code;
	$path	= $folder . '/' . $dref->{'translation_ctry'} . '.json';

	$dref->{'results_list'}  = $dref->{'cntr_txt'}->{'states_success'} . "<br />\n";
	$dref->{'results_list'} .= '<br />' . $lang_code . '/' . $dref->{'translation_ctry'} . ".json\n";

	unless(-d $folder) {
		mkdir($folder, 0755) or &MSOS::Base::handle_errors( "Write JSON File - " . $dref->{'cntr_txt'}->{'trans_folder'} . "<br />$folder<br />$!", 'yes' );
	}

	# Clean up our output text
	$dref->{'translation_text'} = &clean_text($dref->{'translation_text'});

	&MSOS::Base::open_write_file(
        $fh,
        $path,
        'write_json_file -> ' . $dref->{'cntr_txt'}->{'states_failed'},
        $dref->{'translation_text'}
	);

	# Special case for rewriting the 'base' nls file
	if ($def{'translation_set'}) {

		$path = $dref->{'states_path'} . '/' . $dref->{'translation_ctry'} . '.json';
		$dref->{'results_list'} .=   '<br />' . $dref->{'translation_ctry'} . ".json\n";

		&MSOS::Base::open_write_file(
			$fh,
			$path,
			'write_json_file -> set new base: ' . $dref->{'cntr_txt'}->{'states_failed'},
			$dref->{'translation_text'}
		);
	}
}

sub clean_text {
# -----------------------------

    my $text = shift;

    $text =~ s/\n/ /g;
    $text =~ s/\r/ /g;
	$text =~ s/\s+/ /g;

    return $text;
}