export const taiwanRegionLabels: Record<string, string> = {
  TPE: "臺北市", NWT: "新北市", TAO: "桃園市", TXG: "臺中市", TNN: "臺南市", KHH: "高雄市",
  KEE: "基隆市", HSZ: "新竹市", CYI: "嘉義市", HSQ: "新竹縣", MIA: "苗栗縣", CHA: "彰化縣",
  NAN: "南投縣", YUN: "雲林縣", CYQ: "嘉義縣", PIF: "屏東縣", ILA: "宜蘭縣", HUA: "花蓮縣",
  TTT: "臺東縣", PEN: "澎湖縣", KIN: "金門縣", LIE: "連江縣",
  HSINCHU: "新竹（縣／市未定）", CHIAYI: "嘉義（縣／市未定）"
};

// Some edge lookups return legacy province codes (e.g. 04) for Taiwan.
// Only exact, unambiguous city names are promoted to a county/city bucket.
const cityAliases: Record<string, readonly string[]> = {
  TPE: ["Taipei", "Taipei City", "臺北市", "台北市"],
  NWT: ["New Taipei", "New Taipei City", "新北市"],
  TAO: ["Taoyuan", "Taoyuan City", "桃園市"],
  TXG: ["Taichung", "Taichung City", "臺中市", "台中市"],
  TNN: ["Tainan", "Tainan City", "臺南市", "台南市"],
  KHH: ["Kaohsiung", "Kaohsiung City", "高雄市"],
  KEE: ["Keelung", "Keelung City", "基隆市"],
  HSZ: ["Hsinchu City", "新竹市"],
  HSQ: ["Hsinchu County", "Zhubei", "Zhubei City", "新竹縣", "竹北市"],
  CYI: ["Chiayi City", "嘉義市"],
  CYQ: ["Chiayi County", "嘉義縣"],
  HSINCHU: ["Hsinchu", "新竹"],
  CHIAYI: ["Chiayi", "嘉義"],
  MIA: ["Miaoli", "Miaoli City", "Miaoli County", "苗栗市", "苗栗縣"],
  CHA: ["Changhua", "Changhua City", "Changhua County", "彰化市", "彰化縣"],
  NAN: ["Nantou", "Nantou City", "Nantou County", "南投市", "南投縣"],
  YUN: ["Yunlin", "Yunlin County", "Douliu", "Douliu City", "雲林縣", "斗六市"],
  PIF: ["Pingtung", "Pingtung City", "Pingtung County", "屏東市", "屏東縣"],
  ILA: ["Yilan", "Yilan City", "Yilan County", "宜蘭市", "宜蘭縣"],
  HUA: ["Hualien", "Hualien City", "Hualien County", "花蓮市", "花蓮縣"],
  TTT: ["Taitung", "Taitung City", "Taitung County", "臺東市", "台東市", "臺東縣", "台東縣"],
  PEN: ["Penghu", "Penghu County", "Magong", "Magong City", "澎湖縣", "馬公市"],
  KIN: ["Kinmen", "Kinmen County", "金門縣"],
  LIE: ["Lienchiang", "Lienchiang County", "Matsu", "連江縣", "馬祖"]
};
const cityToRegion = new Map(Object.entries(cityAliases).flatMap(([region, names]) => names.map(name => [name.toLowerCase(), region] as const)));

export function normalizeTaiwanRegion(region: string | null, encodedCity: string | null): string | null {
  const code = region?.toUpperCase().replace(/^TW-/, "");
  if (code && Object.hasOwn(taiwanRegionLabels, code)) return code;
  if (!encodedCity || encodedCity.length > 256) return null;
  try {
    const city = decodeURIComponent(encodedCity).trim().toLowerCase().replace(/\s+/g, " ");
    return cityToRegion.get(city) ?? null;
  } catch {
    return null;
  }
}
