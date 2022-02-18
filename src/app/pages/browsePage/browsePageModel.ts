import Card from "../../components/card/card";
import ClientManager from "../../services/clientManager";
import CloudinaryManager from '../../services/cloudinarySDK';
import Utils from '../../services/utils';
import { TWorkout } from '../../services/types';

class BrowsePageModel {
    private clientManager: ClientManager;
    private cards: Array<Card>;
    private sdk: CloudinaryManager;
    private currentCardId: string;

    constructor() {
        this.clientManager = new ClientManager();
        this.sdk = new CloudinaryManager();
        this.cards = [];
        this.currentCardId = '';
    }

    public async getData() {
        const data = await this.clientManager.getWorkouts();
        if (data) {
            this.cards = data.map(item => {
                return new Card(item);
            });
        }
        // console.log(this.cards);
    }

    public getRandomWorkout(): Card {
        const index = Utils.randomInteger(0, 44);
        this.currentCardId = this.cards[index].id!;
        return this.cards[index];
    }

    public getCardById(id: string): Card | void {
        let currCard!: Card;
        this.cards.forEach((card: Card) => {
            if (card.id === id) {
                currCard = card;
            }
        });

        return currCard;
    }

    public getVideoLink(): string {
        const card = this.getCardById(this.currentCardId);
        let url = '';
        if (card) {
            url = this.sdk.getVideoUrl(card.data.title);
        }

        return url;
    }

    public filterCardArray(type: string, value: string): Array<Card> {
        const filteredCardArray = this.cards.filter((card) => card.data[type] === value);
        return filteredCardArray;
    }
}

export default BrowsePageModel;
