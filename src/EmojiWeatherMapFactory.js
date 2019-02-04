import EmojiWeatherMapRow from './EmojiWeatherMapRow';
import EmojiWeatherMapOffset from './EmojiWeatherMapOffset';
import EmojiWeatherMapEmoji from './EmojiWeatherMapEmoji';


export default class EmojiWeatherMapFactory {
    static build(template) {
        for (let rowNumber = 0; rowNumber < template.rows.length; rowNumber++) {
            for (let itemNumber = 0; itemNumber < template.rows[rowNumber].items.length; itemNumber++) {
                const element = template.rows[rowNumber].items[itemNumber];
                console.log(element);
            }
        }
    }
}