import footer from '../../components/footer/footer';
import header from '../../components/header/header';
import NavBar from '../../components/header/navbar';
import storageManager from '../../services/storageManager';
import MaterializeHandler from '../../services/materialize/materializeHandler';

class ProfilePageView {
    private rootNode: HTMLElement;

    private materializeHandler: MaterializeHandler;

    constructor() {
        this.rootNode = <HTMLElement>document.getElementById('app');
        this.materializeHandler = new MaterializeHandler();
    }

    render() {
        this.rootNode.textContent = '';
        this.rootNode.append(header.getTemplate());
        const user = <string>storageManager.getItem('user', 'local');
        const navWrapper = this.rootNode.querySelector('.nav-wrapper') as HTMLElement;
        const navbar = new NavBar(navWrapper, ['Program', 'Browse', 'Meal', 'Settings'], false, [
            'user',
            'browse',
            'meal',
            'settings',
        ]);
        navbar.generateMenu();
        navbar.addProfileLink(user, true);

        this.rootNode.insertAdjacentHTML('beforeend', this.template());

        this.rootNode.append(footer.getTemplate());
        this.materializeHandler.initModal();
        console.log(document.querySelectorAll('.modal'));
    }

    private template(): string {
        return `
        <main class="main-layout">
            <div class="profile-header">
                <div class="profile-decorative"></div>
                <div class="profile-decorative narrow"></div>
                <div class="profile-header_info z-depth-1">
                    <div class="avatar">
                        <canvas class="profile-avatar"></canvas>
                        <span class="icon-upload"><i class="icon pencil"></i></span>
                    </div>
                    <p class="profile-name title">Olga</p>
                    <div class="profile-workout-info">
                        <div class="profile-stats-block">
                            <div class="profile-stats-icon"><i class="icon medal"></i></div>
                            <div class="profile-stats-info">
                                <p>0</p>
                                <p>Workouts</p>
                            </div>
                        </div>
                        <div class="profile-stats-block">
                        <div class="profile-stats-icon"><i class="icon calories"></i></div>
                        <div class="profile-stats-info">
                            <p>0</p>
                            <p>Calories</p>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
            <div class="profile-content-block">
                <h2 class="title">Achievements</h2>
                <div class="profile-content item">
                    <a href="#modal1" class="achievement-card modal-trigger">
                        <img src="../../../assets/img/badges/1.png" width="100" height="100" alt="Bagde">
                    </a>
                    
                    <div id="modal1" class="modal profile">
                        <div class="modal-content">
                        <img class="badge-img-modal" src="../../../assets/img/badges/1.png" width="300" height="300" alt="Bagde">
                        <h4 class="badge-title">GameOn Badge</h4>
                        <p class="badge-subtitle">Awarded for completing a 1st workout on FitOnClone.</p>
                        </div>
                    </div>

                    <a class="achievement-card">
                        <img src="../../../assets/img/badges/2.png" width="100" height="100" alt="Bagde">
                    </a>
                    <a class="achievement-card">
                        <img src="../../../assets/img/badges/3.png" width="100" height="100" alt="Bagde">
                    </a>
                    <a class="achievement-card">
                        <img src="../../../assets/img/badges/4.png" width="100" height="100" alt="Bagde">
                    </a>
                    <a class="achievement-card">
                        <img src="../../../assets/img/badges/5.png" width="100" height="100" alt="Bagde">
                    </a>
                    <a class="achievement-card">
                        <img src="../../../assets/img/badges/6.png" width="100" height="100" alt="Bagde">
                    </a>                                                                                
                </div>
            </div>
        </main>
        `;
    }
}

export default ProfilePageView;
