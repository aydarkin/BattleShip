window.onload = () => {
    const form = document.querySelector('.register');
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const gameContainer = document.querySelector('.game');
        gameContainer.className = 'game game_process';

        const playerTable = document.querySelector('.field_player');
        const rivalTable = document.querySelector('.field_rival');
        const info = document.querySelector('.game__status');
        const input = document.querySelector('.register__input_text');
    
        const game = new BattleShip(input.value, playerTable, rivalTable, info);

        const restartBtn = document.querySelector('.game__restart');
        restartBtn.addEventListener('click', (event) => {
            event.preventDefault();

            game.prepareFields();
        })

    })    
}