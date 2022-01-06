/**
 * General static utils for helping with normalizing data
 */
export class SchemaUtils {
  public static removeExtraDescriptionsFromString(s: string): string {
    const prepositions = [' in ', ' IN ', ' with ', ' WITH '];
    for (const preposition of prepositions) {
      const index = s.indexOf(preposition);
      if (index == -1) {
        continue;
      }
      s = s.substring(0, index);
    }
    return s;
  }

  public static applySimpleReplacements(s: string): string {
    const handbagKey = 'handbags';
    const bagsKey = 'bags';
    const toteKey = 'tote';
    const beltBag = 'Belt Bag';
    const backpack = 'backpack';
    const messengerBag = 'Messenger';
    const replacementMapping: { [key: string]: string } = {
      handbag: handbagKey,
      HandBag: handbagKey,
      HANDBAG: handbagKey,
      bags: bagsKey,
      bag: bagsKey,
      totes: toteKey,
      TOTES: toteKey,
      Totes: toteKey,
      'Belt Bags': beltBag,
      'Belt bags': beltBag,
      'belt-bags': beltBag,
      Backpacks: backpack,
      'Messenger bags': messengerBag,
      Travel: '',
      Badges: '',
    };
    if (replacementMapping[s]) {
      return replacementMapping[s];
    }
    return s;
  }
}
