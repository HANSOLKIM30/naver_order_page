import { html } from "lit";
import View from "../view";
import { SpinButton } from "./SpinButton";

import { fetchGetMenuOptions } from "../api"
import { getMoneyString } from "../utils/currency";

const DEFAULT_OPTION = {
    id: 1,
    baseOptions: [],
    toppingSelectOptions: [],
    toppingAmountSelectOptions: [],
}

export default class OptionPopup extends View {
    constructor(
        menu,
        menuAmount, 
        isPopupOpen, 
        closeOrderPopup, 
        onIncreaseAmount, 
        onDecreaseAmount
        ) {
        super();

        this.menu = menu;
        this.menuAmount = menuAmount;
        this.isPopupOpen = isPopupOpen;
        this.option = DEFAULT_OPTION;
        this.closeOrderPopup = closeOrderPopup;
        this.onIncreaseAmount = onIncreaseAmount;
        this.onDecreaseAmount = onDecreaseAmount;

        const [menuId] = location.pathname.split('/').splice(-1);

        fetchGetMenuOptions(menuId).then(response => this.option = response);
    }

    static get properties() {
        return {
            menu: { type: Object },
            menuAmount: { type: Number },
            isPopupOpen: { type: Boolean },
            option: { type: Object },
            closeOrderPopup: { type: Function },
            onIncreaseAmount: { type: Function },
            onDecreaseAmount: { type: Function },
        }
    }

    toggleBaseOption(optionName) {
        const newOption = { ...this.option };
        const targetOption = newOption.baseOptions.find((element) => element.name === optionName);

        targetOption.isSelelcted = !targetOption.isSelelcted;

        this.option = newOption;
    }

    toggleToppingSelectOption(optionName) {
        const newOption = { ...this.option };

        const targetOption = newOption.toppingSelectOptions.find((element) => element.name === optionName);

        // 현재 targetOption의 isSelected의 반대되는 값을 할당
        targetOption.isSelelcted = !targetOption.isSelelcted;

        this.option = newOption;
    }

    increaseOptionAmount(optionName) {
        // 전개연산자 ...를 통한 깊은 복사(원본 option과 그 하위 속성의 값을 바꾸지 않게 하기 위함.)
        const newOption = { ...this.option };

        // find() 메서드는 주어진 판별 함수를 만족하는 첫 번째 요소의 값을 반환한다.
        // option을 깊은 복사한 newOption 객체의 toppingAmountSelectOption 속성에서 ()안의 판별함수를 만족하는 요소가 있는지 검사하고, 있을 경우 해당 값을 targetOption에 할당한다.
        const targetOption = newOption.toppingAmountSelectOptions.find((element) => element.name === optionName);

        // newOption의 toppingAmountSelectOption의 요소 중 조건을 만족하는 targetOption의 amount를 1 증가
        targetOption.amount += 1;

        this.option = newOption;
    }

    decreaseOptionAmount(optionName) {
        const newOption = { ...this.option };
        const targetOption = newOption.toppingAmountSelectOptions.find((element) =>  element.name === optionName);
        
        if(targetOption.amount <= 0) {
            return;
        }

        targetOption.amount -= 1;

        this.option = newOption;
    }

    render() {
        return html`
            <div class="option-popup-area ${this.isPopupOpen ? '' : 'hidden'}">
                <div class="dimmed-layer light"></div>
                <div class="menu-option-popup">
                    <svg class="content-top-pattern" width="100%" height="100%">
                        <defs>
                            <pattern id="pattern-triangle" x="0" y="0" width="10" height="11" patternUnits="userSpaceOnUse">
                                <polygon points="5 5, 10 10, 10 11, 0 11, 0 10"></polygon>
                            </pattern>
                        </defs>
                        <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-triangle)"></rect>
                    </svg>
                    <div class="content-top">
                        <div class="common-inner">
                            <div class="menu-img-area">
                                <img src="${this.menu.imageUrl}" alt="${this.menu.name}" class="menu-img">
                            </div>
                            <div class="menu-detail-area">
                                <p class="menu-name">
                                    <span class="name">${this.menu.name}</span>
                                    <span class="badge">${this.menu.orderType}</span>
                                </p>
                                ${SpinButton({
                                    count: this.menuAmount,
                                    onIncrease: this.onIncreaseAmount,
                                    onDecrease: this.onDecreaseAmount, 
                                })}
                            </div>
                            <button class="btn-close" @click=${this.closeOrderPopup}>
                                <img src="../assets/images/ico-close.svg" alt="order popup close button" class="ico-close">
                            </button>
                        </div>
                    </div>

                    <div class="content-body">
                        <topping-base-option-groups 
                            .items=${this.option.baseOptions}
                            .toggleBaseOption=${this.toggleBaseOption.bind(this)}
                        >
                        </topping-base-option-groups>
                        <topping-select-option-groups 
                            .items=${this.option.toppingSelectOptions}
                            .toggleToppingSelectOption=${this.toggleToppingSelectOption.bind(this)}
                        >
                        </topping-select-option-groups>
                        <!-- 부분적용함수 bind를 통해 추후 인자를 넘기고 실행 -->
                        <topping-amount-option-groups 
                            .items=${this.option.toppingAmountSelectOptions}
                            .onIncreaseOptionAmount=${this.increaseOptionAmount.bind(this)}
                            .onDecreaseOptionAmount=${this.decreaseOptionAmount.bind(this)}
                        >
                        </topping-amount-option-groups>
                    <div class="content-bottom">
                        <button class="btn-order">${this.menuAmount}개 담기 ${getMoneyString(this.menu.price * this.menuAmount)}</button>
                    </div>
                </div>
            </div>
        `
    }
}