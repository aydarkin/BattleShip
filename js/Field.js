'use strict';
/**
 * Состояния поля:
 * 0 - пусто
 * 1 - стоит целая часть корабля
 * 2 - граничная область вокруг корабля
 * 3 - отметка промаха
 * 4 - поврежденная часть корабля
 */
class Field {
    /**
     * 
     * @param {HTMLTableElement} table 
     * @param {number} size 
     */
    constructor(table, size) {
        this.size = size;
        this.table = table;
        
        this.field = new Array(this.size);
        for (let i = 0; i < this.field.length; i++) {
            this.field[i] = new Array(this.size);
        }

        this.ships = [ new Ship(4)];
        this.clear();
    }

    clear() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.field[i][j] = 0;
            }   
        }
        
        this.clearTable();
    }

    clearTable() {
        let html = '<tbody>';
        for (let i = 0; i < this.size; i++) {
            html += '<tr>';
            for (let j = 0; j < this.size; j++) {
                html += '<td></td>';
            }  
            html += '</tr>' ;
        }
        html += '</tbody>';

        this.table.innerHTML = html;
    }

    /**
     * Определение координат для корабля
     * @param {*} ship 
     */
    setRandomPosition(ship) {
        const x = Math.trunc(Math.random() * (this.size));
        const y = Math.trunc(Math.random() * (this.size));
        const direction = ['horizontal, vertical'][Math.trunc(Math.random() * 10) % 2];

        ship.setPosition(x, y, direction);

        if (this.field[x][y] == 0) {
            if (this.сheckLocation(ship)) {
                return;
            }
        }
        //рекурсивный вызов
        this.setRandomPosition(ship);
    }

    /**
     * Проверка вмещаемости корабля в поле согласно правилам игры
     * @param {Ship} ship
     * 
     */
    сheckLocation(ship) {
        if(ship.endX >= this.size || ship.endY >= this.size) {
            return false;
        }

        const coords = ship.coordinates();
        for (const c of coords) {
            if(this.field[c.x][c.y] != 0) {
                return false;
            }
        }
        if (this.checkBounds(ship)) {
            return true;
        }

        return true;
    }
    
    /**
     * Проверка границ для будущего корабля
     * @param {Ship} ship
     * @returns {boolean}
     */
    checkBounds(ship) {
        const bounds = this.getBoundsShip(ship);

        for (let x = bounds.left; x <= bounds.right; x++) {
            for (let y = bounds.up; y <= bounds.down; y++) {
                if (this.field[y][x] == 1) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Получение граничной область корабля (в радиусе 1 блока) с учетом размера поля
     * @param {Ship} ship 
     */
    getBoundsShip(ship) {
        const lastCell = this.size - 1;
        return {
            left: ship.startX <= 0 ? 0  : ship.startX - 1,
            right: ship.endX >= lastCell ? lastCell :  ship.endX + 1,
            up: ship.startY <= 0 ? 0  : ship.startY - 1,
            down: ship.endY >= lastCell ? lastCell :  ship.endY + 1,
        }
    }

    /**
     * Отображение корабля на поле
     * @param {*} ship 
     */
    markShip(ship) {
        const bounds = this.getBoundsShip(ship);
        for (let x = bounds.left; x <= bounds.right; x++) {
            for (let y = bounds.up; y <= bounds.down; y++) {
                this.field[y][x] = 2;
            }
        }

        const coords = ship.coordinates();
        for (const c of coords) {
            this.field[c.y][c.x] = 1;
        }
    }

    /**
     * Произведен ли выстрел раннее по этим координатам
     * @param {number} x 
     * @param {number} y 
     */
    isShooted(x, y) {
        if ((this.field[y][x] == 3) || (this.field[y][x] == 4)) {
            return true;
        }
        return false;
    }

    /**
     * Осуществление выстрела
     * @param {number} x 
     * @param {number} y 
     */
    makeShot(x, y) {
        if(!this.isShooted(x, y)) {
            this.ships.forEach((ship) => {
                if(ship.takeDamage(x,y)) {
                    this.markShot(x, y, true);
                    ship.draw(this.table);

                    if(ship.isDestroyed()){
                        this.encircleShip(ship);
                    }
                    return true;
                }
            });
            this.markShot(x, y, false);
            return true;
        }
        return false;
    }

    /**
     * Отображение выстрела на поле
     * @param {number} x 
     * @param {number} y 
     * @param {boolean} isSuccess 
     */
    markShot(x, y, isSuccess) {
        //3 - промах, 4 - попадание
        this.field[y][x] = isSuccess ? 4 : 3;

        if(!isSuccess) {
            this.table.rows[y].cells[x].innerHTML = `<div class="field__cell field__fail"></div>`;
        }
    }

    /**
     * Добавление корабля на поле в случайную позицию
     * @param {Ship} ship 
     */
    addShip(ship) {
        const index = this.ships.push(ship);
        
        this.setRandomPosition(this.ships[index]);
        this.markShip(this.ships[index]);
    }

    /**
     * Имеются ли на поле неуничтоженные корабли
     */
    hasAlive() {
        this.ships.forEach((ship) => {
            if(!ship.isDestroyed()) {
                return true;
            }
        });
        return false;
    }  

    /**
     * Пометка пустых ячеек вокруг уничтоженного корабля
     * @param {*} ship 
     */
    encircleShip(ship){
        const bounds = this.getBoundsShip(ship);
        for (let x = bounds.left; x <= bounds.right; x++) {
            for (let y = bounds.up; y <= bounds.down; y++) {
                if(this.field[y][x] == 2) {
                    this.field[y][x] = 3;
                }       
            }
        }
    }
}