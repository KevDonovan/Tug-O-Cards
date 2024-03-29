
document.querySelector("#deal").addEventListener("click", shuffle);
let playerCards = document.querySelectorAll(".playerHand");
let houseCards = document.querySelectorAll(".houseHand");
let modal = document.querySelector('.modal');
let overlay = document.querySelector('.overlay');
let deckID = '';
let score = 0;
let remainingCards = 52;
let playerHand = ['inactive', 'inactive', 'inactive', 'inactive'];
let houseHand = ['inactive', 'inactive', 'inactive', 'inactive'];
let targetScore = 21;

document.querySelector('#openModal').addEventListener('click', openModal);
document.querySelector('#closeModal').addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);


playerCards.forEach((card, i)=> {
    card.addEventListener('click', () => {
        playCard(i);
    });
});

function openModal() {
    modal.classList.add('active');
    overlay.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
    overlay.classList.remove('active');
}

async function shuffle() {
    try{
        const res = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1");
        const data = await res.json();

        console.log(data);
        deckID = data.deck_id;
        drawHand();
    }
    catch (error) {
        console.log(`error ${error}`);
    }
}

async function drawHand() {
    try{
        for(let i = 0; i < playerCards.length; i++) {
            if(playerHand[i] === 'inactive' && remainingCards > 0) await drawCard(i, 'player');
            if(houseHand[i] === 'inactive' && remainingCards > 0) await drawCard(i, 'house');
        }
    }
    catch (error) {
        console.log(`error ${error}`);
    }
}

async function drawCard(n, hand) {
    try{
        const res = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckID}/draw/?count=1`)
        const data = await res.json();
        if (hand === 'player') playerCards[n].src = data.cards[0].image;
        else houseCards[n].src = data.cards[0].image;
        data.cards[0].point = setPoint(data.cards[0]);
        if (hand === 'player') playerHand[n] = data.cards[0];
        else houseHand[n] = data.cards[0];
        setRemainingCards(data.remaining);
        console.log(remainingCards);
    }
    catch (error) {
        console.log(`error ${error}`);
    }
}

function setRemainingCards(remaining) {
    remainingCards = remaining;
    document.querySelector("#remain").innerHTML = remainingCards;
}

function setPoint(card) {
    let sign = 1;
    if(card.suit == 'HEARTS' || card.suit == 'DIAMONDS') sign = -1;

    const face = ['JACK', 'QUEEN', 'KING', 'ACE'];
    const faceVal = [11, 12, 13, 1];

    if(Number(card.value) > 0) {
        return Number(card.value) * sign;
    } else {
        return faceVal[face.indexOf(card.value)] * sign;
    }
}

function checkDeal() {
    if(playerHand.filter(card => card != 'inactive').length == 1 && remainingCards > 0) {
        drawHand();
    }
}

function playCard(n) {
    if(playerHand[n] != 'inactive') {
        score += playerHand[n].point;
        document.querySelector("#score").innerHTML = score;
        //drawCard(n, 'player');
        playerHand[n] = 'inactive';
        playerCards[n].src = "css/assets/back.png";
        housePlay();
        checkDeal();
    }
}

function housePlay() {
    let n = housePick();
    console.log(houseHand[n]);
    score += houseHand[n].point;
    document.querySelector("#score").innerHTML = score;
    houseHand[n] = 'inactive';
    houseCards[n].src = "css/assets/back.png";
    //drawCard(n, 'house');
    checkEnd();
}

function housePick() {
    let activeIndices = [];
    houseHand.forEach((card, i) => {
        if(card != 'inactive') activeIndices.push(i);
    })
    let randomIndex = Math.floor(Math.random() * activeIndices.length);
    return activeIndices[randomIndex];
}

async function checkEnd() {
    await awaitTimeout(2000);
    if(score === targetScore) {
        window.alert("You Win!");
        location.reload();
    }else if (score === -targetScore) {
        window.alert("You lose!");
        location.reload();
    }else if (remainingCards === 0 && houseHand.filter(e => e === 'inactive').length == 3) {
        if((score > 0 && score < targetScore) || score < -targetScore){
            window.alert("You Win!");
        } else if ((score < 0 && score > -targetScore) || score > targetScore){
            window.alert("You lose!");
        } else {
            window.alert("Draw!");
        }
        location.reload();
    }
}

function awaitTimeout(t) {
    return new Promise((resolve) => {
        setTimeout(() => resolve('test'), t)
    })
}