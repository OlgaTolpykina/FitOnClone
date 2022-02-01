import OnboardingPageView from './onboardingPageView';
import OnboardingModel from './onboardingPageModel';
import router from '../../router/router';
import { Height, Weight, Colors, Coefficients, Goal, Message } from '../../services/constants';

class OnboardingPageController {
    private view: OnboardingPageView;

    private model: OnboardingModel;

    private isFeet: boolean;

    private isPounds: boolean;

    private blocks: Array<string>;

    private block: number;

    private classes: Array<string>;

    constructor() {
        this.view = new OnboardingPageView();
        this.model = new OnboardingModel();
        this.isFeet = false;
        this.isPounds = false;
        this.blocks = [
            'About you',
            `What's your goal?`,
            'How many workouts per week do you want?',
            'Select all your favorite type of classes:',
            'How much time do you prefer to work out?',
            'How many weeks do you want to start with?',
        ];
        this.block = 0;
        this.classes = [];
    }

    public createPage() {
        this.view.render(
            this.blocks[this.block],
            this.handleValueSelect.bind(this),
            this.handleRangeSliderInput.bind(this),
            this.handleButtonClick.bind(this)
        );
    }

    public handleValueSelect(e: Event): void {
        const clickedElement = <HTMLElement>e.target;
        const className = clickedElement.className;

        if (typeof className === 'object') return;

        if (className.includes('gender-item')) {
            this.handleGenderSelect(e);
        } else if (className.includes('datepicker-done')) {
            this.handleDayBirthSelect(e);
        } else if (className.includes('icon-select')) {
            this.handleParametersSelect(e);
        } else if (className.includes('unit')) {
            this.handleUnitSelect(e);
        } else if (className.includes('goal')) {
            this.handleGoalSelect(e);
        } else if (className.includes('frequency')) {
            this.handleFrequencySelect(e);
        } else if (className.includes('classes')) {
            this.handleClassesSelect(e);
        } else if (className.includes('length')) {
            this.handleLengthSelect(e);
        } else if (className.includes('duration')) {
            this.handleDurationSelect(e);
        }
    }

    private handleGenderSelect(e: Event): void {
        this.selectValue(e);
        this.registerSelectedValue(e);
    }

    private handleDayBirthSelect(e: Event): void {
        const currentTarget = <HTMLElement>e.currentTarget;
        const calenderInput = <HTMLInputElement>currentTarget.children.namedItem('datepicker');

        this.model.changeHandler({ age: calenderInput.value });
    }

    private handleParametersSelect(e: Event): void {
        const selectBlocks = document.querySelectorAll('.select-block');
        const select = (<HTMLElement>e.currentTarget).children[2];

        selectBlocks.forEach((block) => {
            if (block.id !== select.id) block.className = 'select-block';
        });
        select.classList.toggle('active');
    }

    private handleUnitSelect(e: Event): void {
        const nextElement = (<HTMLElement>e.target).nextElementSibling as HTMLElement;
        const previousElement = (<HTMLElement>e.target).previousElementSibling as HTMLElement;
        if (nextElement) nextElement.classList.remove('active');
        if (previousElement) previousElement.classList.remove('active');
        (<HTMLElement>e.target).classList.add('active');

        this.convertUnits(e);
    }

    private convertUnits(e: Event): void {
        const className = (<HTMLElement>e.target).className;
        const heightSlider = <HTMLInputElement>document.querySelector('[data-height]');
        const weightSlider = <HTMLInputElement>document.querySelector('[data-weight]');
        let unit = '';
        let value = '';

        if (className.includes('feet')) {
            this.isFeet = true;
            unit = 'ft';
            console.log(unit);
            value = Math.round(+heightSlider.value * Coefficients.toFeet).toString();
        } else if (className.includes('centimeters')) {
            this.isFeet = false;
            unit = 'cm';
            value = heightSlider.value;
        } else if (className.includes('pounds')) {
            this.isPounds = true;
            unit = 'lbs';
            value = Math.round(+weightSlider.value * Coefficients.toPounds).toString();
        } else if (className.includes('kilograms')) {
            this.isPounds = false;
            unit = 'kg';
            value = weightSlider.value;
        }

        (<HTMLElement>e.currentTarget).children[1].children[1].textContent = unit;
        (<HTMLElement>e.currentTarget).children[1].children[0].textContent = value;
    }

    public handleRangeSliderInput(e: Event): void {
        const parametersType = (<HTMLElement>e.currentTarget).id;
        const rangeSlider = <HTMLInputElement>e.target;
        let minValue = 0;
        let maxValue = 0;
        let coefficient = 0;
        let unit = false;

        if (parametersType === 'height') {
            minValue = +Height.min;
            maxValue = +Height.max;
            coefficient = Coefficients.toFeet;
            unit = this.isFeet;
        } else if (parametersType === 'weight' || parametersType === 'desiredWeight') {
            minValue = +Weight.min;
            maxValue = +Weight.max;
            coefficient = Coefficients.toPounds;
            unit = this.isPounds;
        }

        (<HTMLElement>e.currentTarget).children[1].children[0].textContent = !unit
            ? rangeSlider.value
            : Math.round(+rangeSlider.value * coefficient).toString();

        this.model.changeHandler({ [parametersType]: rangeSlider.value });
        this.colorRangeSlider(rangeSlider, minValue, maxValue);
    }

    private colorRangeSlider(slider: HTMLInputElement, min: number, max: number): void {
        const percent = ((+slider.value - min) / (max - min)) * Coefficients.percent;
        slider.style.background = `linear-gradient(to right, ${Colors.primary} 0%, ${Colors.primary} ${percent}%, ${Colors.secondary} ${percent}%, ${Colors.secondary} 100%)`;
    }

    private handleGoalSelect(e: Event): void {
        this.selectValue(e);

        const weightChoiceBlock = <HTMLElement>document.querySelector('.input-group');
        const selectBlock = <HTMLElement>document.querySelector('.select-block');

        if ((<HTMLElement>e.target).dataset.value === Goal.weight) {
            weightChoiceBlock.classList.remove('hidden');
            selectBlock.classList.add('active');
        } else {
            weightChoiceBlock.classList.add('hidden');
            selectBlock.classList.remove('active');
        }

        this.registerSelectedValue(e);
    }

    public handleFrequencySelect(e: Event): void {
        this.selectValue(e);
        this.registerSelectedValue(e);
    }

    public handleClassesSelect(e: Event): void {
        (<HTMLElement>e.target).classList.add('active');
        this.classes.push((<HTMLElement>e.target).textContent as string);

        this.model.changeHandler({ favWorkouts: this.classes });
    }

    public handleLengthSelect(e: Event): void {
        this.selectValue(e);

        const min = (<HTMLElement>e.target).dataset.min;
        const max = (<HTMLElement>e.target).dataset.max;
        this.model.changeHandler({ workoutLength: { min: min, max: max } });
    }

    private handleDurationSelect(e: Event): void {
        this.selectValue(e);
        this.registerSelectedValue(e);
    }

    private registerSelectedValue(e: Event): void {
        const key = <string>(<HTMLElement>e.target).dataset.title;
        const value = <string>(<HTMLElement>e.target).dataset.value;

        this.model.changeHandler({ [key]: value });
    }

    private selectValue(e: Event): void {
        Array.from(<HTMLCollection>(<HTMLElement>e.currentTarget).children).forEach((element) => {
            element.classList.remove('active');
        });
        (<HTMLElement>e.target).classList.add('active');
    }

    public handleButtonClick(e: Event): void {
        e.preventDefault();

        if (this.blocks[this.block] === 'Select all your favorite type of classes:') {
            const favWorkouts = this.model.favWorkouts;
            if (favWorkouts.length === 0) {
                this.createMessage(Message.valueMissing);
                return;
            }
        }

        if (this.block < this.blocks.length - 1) {
            this.block++;
            this.createPage();
        } else {
            this.block = 0;
            this.model.saveSettings();
            const programDuration = this.model.programDuration;
            this.view.renderCongratulations(programDuration, this.handleFinalButtonClick.bind(this));
        }
    }

    private createMessage(text: string) {
        if (text) {
            window.M.toast({ html: `${text}` });
        }
    }

    public handleFinalButtonClick(e: Event): void {
        if ((<HTMLElement>e.target).dataset.btn === 'start') {
            router.navigate('/program');
        }
    }
}

export default OnboardingPageController;
