
async function send_message(url, numbers, message) {
for (let number of numbers) {
    const data = {
    number: number,
    message: message
    };

    try {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        console.log(`Mensaje enviado correctamente al número ${number}.`);
    } else {
        console.log(`Error al enviar el mensaje al número ${number}. Código de estado: ${response.status}`);
    }
    } catch (error) {
    console.error('Error:', error);
    }
}
}
// Ejemplo de uso
export async function recordatorio() {
    const base_url = "http://localhost:3008/v1";
    const message_url = `${base_url}/messages`;
    const numbers = [""];
    const message = "Este es un recordatorio!";
    send_message(message_url, numbers, message);
    // await setTimeout(() => {
    //     const base_url = "http://localhost:3008/v1";
    //     const message_url = `${base_url}/messages`;
    //     const numbers = [""];
    //     const message = "Este es un recordatorio!";
    //     send_message(message_url, numbers, message);
    //     console.log('Han pasado 5 segundos');
    // }, 120000);

    // Envío de mensaje

// Registro de usuario
// const register_url = `${base_url}/register`;
// const number = "";
// const name = "Sebastian";
// await register(register_url, number, name);
}
