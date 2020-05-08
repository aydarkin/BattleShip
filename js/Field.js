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
    constructor(table, size, isRival = false) {
        this.size = size;
        this.table = table;
        this.isRival = isRival;

        this.field = new Array(this.size);
        for (let i = 0; i < this.field.length; i++) {
            this.field[i] = new Array(this.size);
        }

        this.ships = [];
        this.clear();
    }

    clear() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.field[i][j] = 0;
            }   
        }
        this.ships = [];
        this.clearTable();
    }

    clearTable() {
        let html = '<tbody>';
        for (let i = 0; i < this.size; i++) {
            html += '<tr>';
            for (let j = 0; j < this.size; j++) {
                html += '<td><div class="field__cell field__water"></div></td>';
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
        const directions = ['horizontal', 'vertical'];
        let x = 0; 
        let y = 0; 
        let directionId = 0;
        let attempts = 0;

        do {
            attempts++;
            if(attempts < 50) {
                x = Math.trunc(Math.random() * (this.size));
                y = Math.trunc(Math.random() * (this.size));
                directionId = Math.trunc(Math.random() * 10) % 2;
            } else {
                if(directionId >= 1){
                    directionId = 0;
                    const cell = this.getNextCell(x, y);
                    x = cell.x;
                    y = cell.y;
                } else {
                    directionId++;
                }  
            }

            ship.setPosition(x, y, directions[directionId]);
        } while (this.field[y][x] != 0 || !this.сheckLocation(ship));
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
            if(this.field[c.y][c.x] != 0) {
                return false;
            }
        }
        if (!this.checkBounds(ship)) {
            return false;
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
            for (const ship of this.ships) {
                if(ship.takeDamage(x,y)) {
                    this.markShot(x, y, true);
                    ship.draw(this.table);

                    if(ship.isDestroyed()){
                        this.encircleShip(ship);
                    }
                    return true;
                }
            }
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
     * Добавление корабля заданной размерности на поле в случайную позицию
     * @param {number} size - размерность корабля
     */
    addShip(size) {
        const ship = new Ship(size, this.isRival);
        this.ships.push(ship) - 1;
        
        this.setRandomPosition(ship);
        this.markShip(ship);
        ship.draw(this.table);
    }

    /**
     * Имеются ли на поле неуничтоженные корабли
     */
    hasAlive() {
        for (const ship of this.ships) {
            if(!ship.isDestroyed()) {
                return true;
            }
        }
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
                    this.markShot(x, y, false);
                }       
            }
        }
    }

    /**
     * Получение следующей ячейки от заданной (слева направо сверху вниз)
     * @param {number} x 
     * @param {number} y 
     */
    getNextCell(x, y) {
        x++;
        if (x >= this.size) {
            x = 0;
            y++;

            if (y >= this.size) {
                y = 0;
            }
        }
        return {
            x: x,
            y: y,
        }
    }
}