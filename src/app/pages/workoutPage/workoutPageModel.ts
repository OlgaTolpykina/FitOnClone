import Card from '../../components/card/card';
import storageManager from '../../services/storageManager';
import CloudinaryManager from '../../services/cloudinarySDK';
import { TProgress, TProgressData, TSettings, TStatData, TToken, TWorkoutProgram } from '../../services/types';
import ClientManager from '../../services/clientManager';
import Utils from '../../services/utils';

class WorkoutPageModel {
    private cards: Array<Card[]>;

    private sdk: CloudinaryManager;

    private client: ClientManager;

    constructor() {
        this.cards = [];
        this.sdk = new CloudinaryManager();
        this.client = new ClientManager();
    }

    public getData() {
        const data = storageManager.getItem<Array<Card[]>>('workout-cards', 'local');
        if (data) {
            this.cards = data;
        }
    }

    public async getSettingsData(): Promise<void | TSettings> {
        let settings = storageManager.getItem<TSettings>('userSettings', 'local');
        if (!settings) {
            const userData = this.getUserData();
            if (userData) {
                settings = await this.client.getUserSettings(userData.userID);
            }
        }

        return settings;
    }

    public getUserData(): TToken | void {
        return storageManager.getItem<TToken>('token', 'local');
    }

    public getCardById(id: string): Card | void {
        let currCard!: Card;
        this.cards.forEach((card: Card[]) => {
            const cardElem = card.find((elem: Card) => elem.id === id);

            if (cardElem) {
                currCard = cardElem;
            }
        });

        return currCard;
    }

    public getVideoLink(id: string): string {
        const card = this.getCardById(id);
        let url = '';
        if (card) {
            url = this.sdk.getVideoUrl(card.data.title);
        }

        return url;
    }

    public async updateWorkoutData(card: Card): Promise<void> {
        const program = storageManager.getItem<TWorkoutProgram>('workout-program', 'local');
        if (program) {
            program.forEach((workoutWeek) => {
                workoutWeek.forEach((workout) => {
                    if (workout._id === card.id) {
                        workout.completed = true;
                    }
                });
            });
            storageManager.addItem('workout-program', program, 'local');
            const userData = this.getUserData();
            if (userData) {
                await this.client.updateProgram(program, userData.userID);
            }
        }
        storageManager.addItem('workout-cards', this.cards, 'local');
    }

    public async updateSettingsData(dataStat: TStatData): Promise<void> {
        const settings = storageManager.getItem<TSettings>('userSettings', 'local');
        if (settings) {
            this.setStatData(settings, dataStat);
            storageManager.addItem('userSettings', settings, 'local');

            const userData = this.getUserData();
            if (userData) {
                this.client.changeData('userSettings', 'PATCH', userData.userID, settings);
            }
        }
    }

    private setStatData(settings: TSettings, dataStat: TStatData): void {
        settings.weekProgress.minutes += dataStat.time;
        settings.weekProgress.workoutsCompleted += 1;
        settings.weekProgress.calories += dataStat.calories;
        settings.caloriesBurned += dataStat.calories;
        settings.completedWorkouts += 1;
        const date = Utils.getCurrentISODate();
        const weekIndex = storageManager.getItem<number>('numWeek', 'local');

        if (weekIndex !== undefined) {
            if (!settings.progress[weekIndex]) {
                settings.progress.push({ minutes: [], calories: [] });
            }
            const currWeek = settings.progress[weekIndex];
            const currDate = currWeek.minutes.find((weekItem) => weekItem[date]);
            const currCalories = currWeek.calories.find((weekItem) => weekItem[date]);
            this.setData(currDate, date, dataStat.time, currWeek, 'minutes');
            this.setData(currCalories, date, dataStat.calories, currWeek, 'calories');
        }
    }

    private setData(data: TProgressData | void, key: string, value: number, progress: TProgress, type: string): void {
        if (data) {
            if (data[key]) {
                data[key] += value;
            } else {
                data[key] = value;
            }
        } else {
            progress[type].push({ [key]: value });
        }
    }
}

export default WorkoutPageModel;
