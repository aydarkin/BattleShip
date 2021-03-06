'use strict';
class Ship {
    /**
     * 
     * @param {number} size - размерность корабля
     * @param {boolean} isHidden - будет ли отображать целые части на поле
     */
    constructor(size, isHidden = false) {
        this.isHidden = isHidden;
        this.size = size < 1 ? 1 : size;
        
        this.startX = 0;
        this.startY = 0;
        this.hp = this.size;

        this.endX = 0
        this.endY = this.startY + this.size - 1;

        this.hits = [];
    }

    * coordinates() {
        let x = this.startX;
        let y = this.startY;

        while(x <= this.endX && y <= this.endY) {
            yield {
                x: x,
                y: y,
            }
            if (this.direction == 'horizontal') {
                x++;
            }
    
            if (this.direction == 'vertical') {
                y++;
            }
        }
    }

    /**
     * Задание координат коробля на поле
     * @param {number} startX 
     * @param {number} startY 
     * @param {string} direction - направление (horizontal, vertical)
     */
    setPosition(startX, startY, direction = 'horizontal') {
        this.startX = startX;
        this.startY = startY;

        if (direction == 'horizontal') {
            this.endX = this.startX + this.size - 1;
            this.endY = this.startY;
        }
        if (direction == 'vertical') {
            this.endX = this.startX;
            this.endY = this.startY + this.size - 1;
        }
    }

    /**
     * Направление
     */
    get direction() {
        if (this.startX != this.endX) {
            return 'horizontal';
        }

        if (this.startY != this.endY) {
            return 'vertical';
        }
        return 'horizontal';
    }

    /**
     * Получение урона
     * @param {*} shootX 
     * @param {*} shootY
     * @returns {boolean} - получен ли урон
     */
    takeDamage(shootX, shootY) {
        if (this.сheckСoordinates(shootX, shootY)) {
            this.hp--;
            this.hits.push({
                x: shootX,
                y: shootY,
            });
            return true;
        }
        return false;
    }

    /**
     * Проверка уничтожения корабля
     */
    isDestroyed() {
        return this.hp <= 0;
    }

    /**
     * Проверка принадлежности координаты кораблю
     * @param {number} x 
     * @param {number} y 
     */
    сheckСoordinates(x, y) {
        const coordinates = this.coordinates();
        for(const c of coordinates) {
            if(c.x == x && c.y == y){
                return true;
            }
        }  
        return false;
    }

    /**
     * Отрисовка корабля
     * @param {HTMLTableElement} field
     */
    draw(field) {
        const coordinates = this.coordinates();
        for(const c of coordinates) {
            field.rows[c.y].cells[c.x].innerHTML = this.render(c.x, c.y, this.isHidden);
        }
    }


    render(x, y) {
        if(this.isDestroyed()) {
            return `<div class="field__cell field__ship_destroyed"></div>`
        }
        
        if(x !== undefined && y !== undefined){
            for (const hit of this.hits) {
                if(hit.x == x && hit.y == y){
                    return `<div class="field__cell field__ship_hit"></div>`;
                }
            }   
        }

        return `<div class="field__cell field__${this.isHidden ? 'water' : 'ship'}"></div>`;
    }
}