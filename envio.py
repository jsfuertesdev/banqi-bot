import requests, time

def register(url, number, name):
    data = {
        'number': number,
        'name': name
    }

    response = requests.post(url, data=data)

    if response.status_code == 200:
        print("Registro exitoso.")
    else:
        print(f"Error en el registro. Código de estado: {response.status_code}")

def send_message(url, numbers, message):
    for number in numbers:
        data = {
            'number': number,
            'message': message
        }

        response = requests.post(url, data=data)

        if response.status_code == 200:
            print(f"Mensaje enviado correctamente al número {number}.")
        else:
            print(f"Error al enviar el mensaje al número {number}. Código de estado: {response.status_code}")

if __name__ == "__main__":
    base_url = "http://localhost:3008/v1"
    i=0
    while i < 10:
    #    Envío de mensaje
        message_url = f"{base_url}/messages"
        numbers = [""]
        message = "Spam!"
        send_message(message_url, numbers, message)
        # time.sleep(2)
        i = i + 1
    # Registro de usuario
    # register_url = f"{base_url}/register"
    # number = [""]
    # name = "Sebastian"
    # register(register_url, number, name)
    
