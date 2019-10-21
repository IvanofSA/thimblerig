import style from "../css/style.scss";

if (process.env.NODE_ENV === 'development') {
	console.log('Working in development mode');
}

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

class Game {
	constructor(data) {
		this.shuffles = data.shuffles || 5;
		this.speed = data.speed || 500;
		this.cups = $$(data.cups);
		this.ball = $(data.ball);
		this.title = $(data.title);
		this.btn = $(data.btn);

		this.ballId = null;
		this.timerId = null;
		this.bufferTime = 100;
		this.status = 'game';

		this.cupsLength = this.cups.length;

		this.addEventListners();
	}

	addEventListners() {
		// let that = this;
		this.btn.addEventListener('click', () => {
			this.start();
		});
	}

	start() {
		let that = this;
		this.reset();
		this.ballId = this.getRandomInt(1, this.cupsLength);
		this.setPosBall();
		this.timerId = setTimeout(function request() {
			that.shuffle();
			that.timerId = setTimeout(request, that.speed + that.bufferTime);
		}, that.speed);

		setTimeout(() => {
			clearTimeout(that.timerId);
			that.cups.forEach((el) => {
				el.style.cursor = 'pointer';
				el.addEventListener('click', function () {
					that.checkCup(this);
				});
			});
		}, that.shuffles * that.speed)
	}

	checkCup(el) {
		let cupId = el.getAttribute('data-id');

		el.style.bottom = '50px';

		if(cupId == this.ballId) {
			this.ball.style.opacity = '1';
			this.ball.style.bottom = '-50px';
		}
		if(cupId == this.ballId && this.status != 'finish') {
			this.status = 'finish';
			this.title.innerHTML = 'Угадал';
		}
		if(cupId != this.ballId && this.status != 'finish') {
			this.status = 'finish';
			this.title.innerHTML = 'Не угадал';
		}

		this.btn.innerHTML = 'Еще раз';
	}

	reset() {

		clearTimeout(this.timerId);
		this.status = 'game';
		this.title.innerHTML = 'Наперстки';
		this.btn.innerHTML = 'Играть';
		this.ball.style.bottom = '0';
		this.ball.style.opacity = '1';
		this.cups.forEach((el) => {
			el.style.bottom = '0';
			el.style.cursor = 'default';
			el.removeEventListener('click', this.checkCup)
		});
	}

	shuffle() {
		let randCup1 = this.cups[this.getRandomInt(0, this.cupsLength - 1)],
			randCup2 = this.cups[this.getRandomInt(0, this.cupsLength - 1)];

		this.ball.style.opacity = '0';

		if(randCup1.isEqualNode(randCup2)) {
			this.shuffle();
		} else {
			let cup1Offset = randCup1.offsetLeft,
				cup2Offset = randCup2.offsetLeft;

			this.animate({
				duration: this.speed,
				timing: function (timeFraction) {
					return Math.pow(timeFraction, 2);
				},
				draw: function (progress) {

					//finishPos конечные точки
					//cupCurrentPos текущая позиция
					let finishPos1 = cup1Offset + (cup2Offset - cup1Offset),
						finishPos2 = cup2Offset + (cup1Offset - cup2Offset),
						cupCurrentPos1 = (cup1Offset + (cup2Offset - cup1Offset) * progress),
						cupCurrentPos2 = (cup2Offset + (cup1Offset - cup2Offset) * progress);


					// в конце анимации проверяем не уехали заграницы наперстки
					if(progress >= 1) {
						cupCurrentPos1 = (cupCurrentPos1 > finishPos1) || (cupCurrentPos1 < finishPos1) ? finishPos1 : cupCurrentPos1;
						cupCurrentPos2 = (cupCurrentPos2 > finishPos2) || (cupCurrentPos2 < finishPos2) ? finishPos2 : cupCurrentPos2;
					}

					randCup1.style.left = `${cupCurrentPos1}px`;
					randCup2.style.left = `${cupCurrentPos2}px`;
				}
			});
		}
	}

	animate({timing, draw, duration}) {
		let start = performance.now();

		requestAnimationFrame(function animate(time) {
			let timeFraction = (time - start) / duration;
			if(timeFraction < 0) timeFraction = 0;

			let progress = timing(timeFraction);

			draw(progress);

			if(timeFraction < 1) {
				requestAnimationFrame(animate);
			}
		});
	}

	getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	setPosBall() {
		let currentCup = $(`#cup-${this.ballId}`);
		currentCup.insertAdjacentElement('beforeend', this.ball);
	}
}

let game = new Game({
	shuffles: 10,
	speed: 500,
	cups: '.cup',
	ball: '.js-ball',
	title: '.js-msg',
	btn: '.js-start',
});