# Written by David A. Lindkvist 2021-09-27

#Tuneables
input_pin = AnalogPin.P2
read_delay = 20
display_delay = 200
send_delay = 1000
noise_threshold = 4
goal = 100

#Globals
bt_connected=False
total=0
base_val=0
last_val=0
last_read=0
last_display=0
last_send=0

#Setup/reset
bluetooth.start_uart_service()
reset()
def reset():
    global total
    global base_val
    global last_val
    global last_read
    global last_display
    global last_send
    global input_pin
    total = 0
    base_val= pins.analog_read_pin(input_pin)
    last_val = base_val
    last_read = 0
    last_display = 0
    last_send = 0
    
# Main loop
basic.forever(on_forever)
def on_forever():
    global last_read
    global last_display
    global last_send
    now = input.running_time()
    if now > last_read + read_delay:
        last_read = now
        read_input()
    if now > last_display + display_delay:
        last_display = now
        display_total()
    if now > last_send + send_delay:
        last_send = now
        send_total()
    if total > goal:
        display_goal_screen()
        send_goal_reached()
        reset()
    
def read_input():
    global base_val
    global last_val
    global input_pin
    global noise_threshold
    global total
    signal = pins.analog_read_pin(input_pin)
    area = ((signal + last_value )/2 - (base_val + noise_threshold))
    last_value = signal
    if area > 0:
        total += area

def display_total():
    global total
    global goal
    led.plot(0, 0)
    lit_leds = Math.round(Math.map(total, 0, goal, 0, 25))
    for y in range(5):
        for x in range(5):
            if (5*y+x <= lit_leds):
                led.plot(x, y)

def display_goal_screen():
    for i in range(6):
        basic.show_leds("""
            # # # # #
            # # # # #
            # # # # #
            # # # # #
            # # # # #
            """)
        basic.clear_screen()
        basic.pause(25)

def send_total():
    global total
    global goal
    if bt_connected:
        bluetooth.uart_write_line(convert_to_text(total +1))

def send_goal_reached():
    if bt_connected:
        bluetooth.uart_write_line("G")

def on_bluetooth_connected():
    global bt_connected
    bt_connected = True
bluetooth.on_bluetooth_connected(on_bluetooth_connected)

def on_bluetooth_disconnected():
    global bt_connected
    bt_connected = False
bluetooth.on_bluetooth_disconnected(on_bluetooth_disconnected)