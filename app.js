

const TEN_MINUTES = 10*60000
const ONE_MINUTE = 60000

class GameTimer{

	#timers = []
	#clocks =[]

	#teamUpdateCb = []
	#shotClockUpdateCb = []

	#shotClock

	constructor(){
		this.#timers = []
		this.#timers['players'] = 0
		this.#timers['monsters'] = 0

		this.#clocks = []
		this.#clocks['players'] = "10:00.000"
		this.#clocks['monsters'] = "10:00.000"

		this.#teamUpdateCb = []
		this.#shotClockUpdateCb = []
	}

	reset(){
		this.#timers = []
		this.#timers['players'] = 0
		this.#timers['monsters'] = 0

		this.#clocks = []
		this.#clocks['players'] = GameTimer.milisToClock(TEN_MINUTES)
		this.#clocks['monsters'] = GameTimer.milisToClock(TEN_MINUTES)
		for(var fn of this.#teamUpdateCb){
			fn('players', this.#timers['players'], this.#clocks['players'])
			fn('monsters', this.#timers['monsters'], this.#clocks['monsters'])
		}
	}

	pause(){
		clearInterval(this.#shotClock)
	}

	static padClockTime(val, digits){
		var str = '' + val
		if(str.length == digits){
			return str
		}
		if(str.length > digits){
			return str.slice(0, digits)
		}
		return GameTimer.padClockTime('0'+val, digits)
	}

	static milisToClock(time){
		var mins = Math.floor(time / (60000))
		time -= mins * 60000
		var secs = Math.floor((time % 60000) / 1000)
		var millis = time % 1000
		
		// var mins = Math.floor(time / (60000))
		return `${GameTimer.padClockTime(mins, 2)}:${GameTimer.padClockTime(secs, 2)}.${GameTimer.padClockTime(millis,3)}`
	}

	onShotClockUpdate(fn){
		this.#shotClockUpdateCb.push(fn)
	}

	startTeam(team){
		this.pause()
		var startTime = Date.now()
		var oldTime = startTime
		var now = startTime
		var self = this
		this.#shotClock = setInterval(function(){
			oldTime = now
			now = Date.now()
			if(now - startTime >= ONE_MINUTE){
				var shotclock = GameTimer.milisToClock(0)
				self.updateTimer(team, now - oldTime)
				for(var fn of self.#shotClockUpdateCb){
					fn(shotclock)
				}
				self.pause()
				if(team == "monsters"){
					self.startTeam('players')
				} else {
					self.startTeam('monsters')
				}
			}else{
				var elapsedTime = now - startTime
				var shotclock = GameTimer.milisToClock(ONE_MINUTE - elapsedTime)
				self.updateTimer(team, now - oldTime)
				for(var fn of self.#shotClockUpdateCb){
					fn(shotclock)
				}
			}

		}, 1)
	}



	onTeamUpdate(fn){
		this.#teamUpdateCb.push(fn)
	}

	updateTimer(team, delta){
		this.#timers[team] = this.#timers[team] + delta
		var timeLeft = TEN_MINUTES - this.#timers[team]
		var millis = timeLeft % 1000
		var secs = Math.floor(timeLeft / 1000)
		var mins = Math.floor(timeLeft / (60*1000))
		// this.#clocks[team] = `${GameTimer.padClockTime(mins, 2)}:${GameTimer.padClockTime(secs, 2)}.${GameTimer.padClockTime(millis,3)}`
		this.#clocks[team] = GameTimer.milisToClock(timeLeft)
		for(var fn of this.#teamUpdateCb){
			fn(team, this.#timers[team], this.#clocks[team])
		}
	}

}

function saveGame(gameTimer){

}

function loadGame(){

}

function resetGame(){
	
}

$(function () {

	var gameTimer = new GameTimer()
	gameTimer.onTeamUpdate(function(team, time, clock){
		// console.log(team, time, clock)
		$(`[data-clock="${team}"]`).text(clock)
	})
	gameTimer.onShotClockUpdate(function(clock){
		$('.shot-clock').text(clock)
	})
	gameTimer.reset()

	$("[data-team]").on("click", function () {
		var team = $(this).data("team")
		console.log(team)
		if(team == "pause"){
			gameTimer.pause()
		} else {
			gameTimer.startTeam(team)
		}
	});

	$("[data-nav]").on("click", function () {
		$(".page").addClass("d-none")
		$(".page").removeClass("d-block")
		$($(this).data("nav")).removeClass("d-none")
		$($(this).data("nav")).addClass("d-block")
	});
	


});