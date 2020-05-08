'use strict';
class BattleShip {
    /**
     * 
     * @param {string} playerName 
     * @param {HTMLTableElement} playerTable 
     * @param {HTMLTableElement} rivalTable 
     * @param {HTMLElement} infoContainer 
     */
    constructor(playerName, playerTable, rivalTable, infoContainer) {
        this.playerName = playerName;
        this.infoContainer = infoContainer;

        this.playerField = new Field(playerTable, 10);
        this.rivalField = new Field(rivalTable, 10, true);

        this.rivalField.table.addEventListener('click', this.clickPlayer.bind(this));
        this.prepareFields();
    }

    /**
     * Заполнение поля кораблями
     * @param {Field} field 
     */
    fillField(field) {
        const shipSizes = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

        shipSizes.forEach((size) => {
            field.addShip(size);
        });
    }

    /**
     * Подготовка полей для начала игры
     */
    prepareFields() {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.playerField.clear();
        this.rivalField.clear();
        this.fillField(this.playerField);
        this.fillField(this.rivalField);


        this.rivalField.table.addEventListener("click", this.stepPlayer.bind(this, this));
        this.prepareStepPlayer();
    }

    /**
     * Подготовка хода игрока
     */
    prepareStepPlayer() {
        this.infoContainer.textContent = `${this.playerName}, время вашего хода`;
        this.rivalField.table.classList.add('field_step');
        this.playerField.table.classList.remove('field_step');
        this.currentPlayer = 'user';
    }

    /**
     * Подготовка хода соперника (бота)
     */
    prepareStepRival() {
        this.infoContainer.textContent = 'Ходит соперник...';
        this.rivalField.table.classList.remove('field_step');
        this.playerField.table.classList.add('field_step');
        this.currentPlayer = 'rival';
    }

    /**
     * Ход игрока
     * @param {MouseEvent} event 
     */
    stepPlayer(x, y) {
        if (this.currentPlayer == 'user') {
            if (this.rivalField.makeShot(x, y)) {
                if (this.isWin()) {
                    this.end();
                    return;
                }

                this.prepareStepRival();
                this.timer = setTimeout(this.stepBot.bind(this), 2000);
            }
        }
    }

    /**
     * Обработчик события нажатия на поле
     * @param {MouseEvent} event 
     * @param {BattleShip} game
     */
    clickPlayer(event) {
        const ship = event.target;
        const cell = ship.parentElement;

        if (cell.tagName.toLowerCase() != 'td') {
            return;
        }
        const y = cell.parentNode.rowIndex;
        const x = cell.cellIndex;

        this.stepPlayer(x, y);
    }

    /**
     * Ход бота
     */
    stepBot() {
        if (this.currentPlayer == 'rival') {
            this.makeShotRandom();

            if (this.isWin()) {
                this.end();
                return;
            }

            this.prepareStepPlayer();
        }
    }

    /**
     * Произведение выстрела
     */
    makeShotRandom() {
        let x = Math.trunc(Math.random() * 10);
        let y = Math.trunc(Math.random() * 10);
        let fails = 0;

        while (!this.playerField.makeShot(x, y)) {
            fails++;
            if (fails < 50) {
                x = Math.trunc(Math.random() * 10);
                y = Math.trunc(Math.random() * 10);
            } else {
                //начинаем идти по порядку
                const nextCell = this.playerField.getNextCell();
                x = nextCell.x;
                y = nextCell.y;
            }   
        }
    }

    isWin() {
        const field = this.currentPlayer == 'user' ? this.rivalField : this.playerField;
        if (!field.hasAlive()) {
            return true;
        }
        return false;
    }

    end() {
        if (this.currentPlayer == 'user') {
            this.showWinPlayer();
        }

        if (this.currentPlayer == 'rival') {
            this.showWinBot();
        }

        this.currentPlayer = 'none';
    }

    showWinPlayer() {
        this.infoContainer.textContent = this.playerName + ", вы победили!";
    }

    showWinBot() {
        this.infoContainer.textContent = this.playerName + " вы проиграли!";
    }
}