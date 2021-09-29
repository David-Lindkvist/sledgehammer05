function display_goal_screen () {
    for (let index = 0; index < 3; index++) {
        basic.showLeds(`
            # # # # #
            # # # # #
            # # # # #
            # # # # #
            # # # # #
            `)
        basic.clearScreen()
        basic.pause(200)
    }
}
bluetooth.onBluetoothConnected(function () {
    bt_connected = true
})
bluetooth.onBluetoothDisconnected(function () {
    bt_connected = false
})
function read_input () {
    signal = pins.analogReadPin(AnalogPin.P2)
    area = (signal + last_value) / 2 - (base_val + noise_threshold)
    last_value = signal
    if (area > 0) {
        total += area
    }
}
function display_total () {
    led.plot(0, 0)
    lit_leds = Math.round(Math.map(total, 0, goal, 0, 25))
    for (let y = 0; y <= 4; y++) {
        for (let x = 0; x <= 4; x++) {
            if (5 * y + x <= lit_leds) {
                led.plot(x, y)
            }
        }
    }
}
function send_total () {
    if (bt_connected) {
        new_percent = Math.round(100 * (total / goal))
        if (new_percent > 100) {
            new_percent = 100
        }
        if (last_percent != new_percent) {
            last_percent = new_percent
            bluetooth.uartWriteLine(convertToText(new_percent))
        }
    }
}
function reset () {
    total = 0
    base_val = pins.analogReadPin(AnalogPin.P2)
    last_val = base_val
    last_read = 0
    last_display = 0
    last_send = 0
    last_percent = 0
}
function send_goal_reached () {
    if (bt_connected) {
        bluetooth.uartWriteLine("G")
    }
}
let now = 0
let new_percent = 0
let lit_leds = 0
let last_value = 0
let area = 0
let signal = 0
let last_percent = 0
let last_send = 0
let last_display = 0
let last_read = 0
let last_val = 0
let base_val = 0
let total = 0
let bt_connected = false
let goal = 0
let noise_threshold = 0
let read_delay = 5
let display_delay = 200
let send_delay = 200
noise_threshold = 4
goal = 3000
bt_connected = false
total = 0
base_val = 0
last_val = 0
last_read = 0
last_display = 0
last_send = 0
last_percent = 0
// Setup/reset
bluetooth.startUartService()
reset()
// Main loop
basic.forever(function () {
    now = input.runningTime()
    if (now > last_read + read_delay) {
        last_read = now
        read_input()
    }
    if (now > last_display + display_delay) {
        last_display = now
        display_total()
    }
    if (now > last_send + send_delay) {
        last_send = now
        send_total()
    }
    if (total >= goal) {
        send_goal_reached()
        display_goal_screen()
        reset()
    }
})
