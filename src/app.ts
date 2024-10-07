import { join, resolve } from 'path'
import { createBot, createProvider, createFlow, addKeyword, utils } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { recordatorio } from './complements/envio.js'
import { queryBigQuery } from './complements/bigquery_connection';

const PORT = process.env.PORT ?? 3008

// const discordFlow = addKeyword<Provider, Database>('doc').addAnswer(
//     ['You can see the documentation here', '📄 https://builderbot.app/docs \n', 'Do you want to continue? *yes*'].join(
//         '\n'
//     ),
//     { capture: true },
//     async (ctx, { gotoFlow, flowDynamic }) => {
//         if (ctx.body.toLocaleLowerCase().includes('yes')) {
//             return gotoFlow(registerFlow)
//         }
//         await flowDynamic('Thanks!')
//         return
//     }
// )

const learnbanqi = addKeyword<Provider, Database>('1')
    .addAnswer('Banqi es la revolucion de los bancos un banco para la gente donde tu dinero va a personas como tu como yo y los intereses son principalmente para ti y no para banqui, conservamos una pequeña comision por funcionamiento pero los intereses seran 99% tuyos')
    .addAnswer('Aquí tienes una imagen de Banqi:', { media: resolve(process.cwd(), 'assets', 'WhatsApp Video 2024-07-21 at 3.33.59 PM.mp4') }) // Usar resolve en lugar de join

const registerbanqi = addKeyword<Provider, Database>(utils.setEvent('REGISTER_FLOW'))
    .addAnswer(`Cual es tu nombre?`, { capture: true }, async (ctx, { state }) => {
        await state.update({ name: ctx.body })
    })
    .addAnswer('Cual es tu edad?', { capture: true }, async (ctx, { state }) => {
        await state.update({ age: ctx.body })
    })
    .addAnswer('Que categoria de inversor quieres ser? S(50K) AAA(20K) AA(10K) A(5K)', { capture: true }, async (ctx, { state }) => {
    await state.update({ category: ctx.body })
    })
    .addAction(async (_, { flowDynamic, state }) => {
        await flowDynamic(`Bienvenido a Banqi ${state.get('name')}, Gracias por ayudar a crear un mejor mundo de finanzas!: tu edad es: ${state.get('age')} y tu categoria de inversion es: ${state.get('category')}`)
        await console.log(`Bienvenido a Banqi ${state.get('name')}, Gracias por ayudar a crear un mejor mundo de finanzas!: tu edad es: ${state.get('age')} y tu categoria de inversion es: ${state.get('category')}`)
    })
    
const Amountbanqi = addKeyword<Provider, Database>('3').addAnswer(`Tu saldo actual es de `, { capture: false }, async (ctx, { flowDynamic }) => {
        await flowDynamic(`Your name is: ${ctx.from}`)
    })


const bigQueryFlow = addKeyword<Provider, Database>('4')
    .addAnswer('Consultando BigQuery...')
    .addAction(async (_, { flowDynamic }) => {
        try {
            const rows = await queryBigQuery(`SELECT * FROM \`banqi-394708.pruebasbot.pruebaenvio\``);
            await flowDynamic(`Resultados: ${JSON.stringify(rows)}`);
        } catch (error) {
            await flowDynamic('Error al consultar BigQuery');
        }
    });

const insertDataFlow = addKeyword<Provider, Database>('5')
    .addAnswer('Por favor, envía el mensaje que deseas guardar en BigQuery:', { capture: true })
    .addAction(async (ctx, { flowDynamic, state }) => {
        // Configura un tiempo de espera de 30 segundos
        const timeout = 30000; // 30 segundos
        const startTime = Date.now();

        // Espera la respuesta del usuario
        const userMessage = await new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                if (ctx.body) {
                    clearInterval(interval);
                    resolve(ctx.body);
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(interval);
                    reject(new Error('Tiempo de espera agotado'));
                }
            }, 1000);
        }).catch(error => {
            // flowDynamic('No se recibió una respuesta a tiempo. Por favor, intenta de nuevo.');
            throw error;
        });

        try {
            const phoneNumber = parseInt(ctx.from);
            const insertQuery = `INSERT INTO \`banqi-394708.pruebasbot.pruebaenvio\` (numero_de_telefono, mensaje, opcion) VALUES (${phoneNumber}, '${userMessage}', '1')`;
            await queryBigQuery(insertQuery);
            await flowDynamic(`Datos insertados correctamente para el número de teléfono: ${phoneNumber} con el mensaje: ${userMessage}`);
        } catch (error) {
            await flowDynamic('Error al insertar datos en BigQuery');
        }
    });

const welcomeFlow = addKeyword<Provider, Database>(['frasesecretainadivinable'])
    .addAnswer(`🙌 Hola bienvenido a banqi!! en que te puedo ayudar el dia de hoy`)
    .addAnswer(
        [
            '1. Quiero aprender de banqi',
            '2. Quiero registrarme en banqui',
            '3. Cual es mi saldo en banqi',
            '4. Consultar BigQuery',
            '5. Insertar datos en BigQuery',
        ].join('\n'),
        { delay: 800, capture: true },
        async (ctx, { fallBack, gotoFlow }) => {
            if (!['1', '2', '3', '4', '5'].some(valor => ctx.body.toLocaleLowerCase().includes(valor))) {
                return fallBack('Debes escoger una de las opciones 1,2,3,4,5!')
            }
            if (ctx.body === '1'){
                return gotoFlow(learnbanqi)
            }
            if (ctx.body === '2'){
                return gotoFlow(registerbanqi)
            }
            if (ctx.body === '3'){
                return gotoFlow(Amountbanqi)
            }
            if (ctx.body === '4'){
                return gotoFlow(bigQueryFlow)
            }
            if (ctx.body === '5'){
                return gotoFlow(insertDataFlow)
            }
            return
        })

const welcomeNewClientFlow = addKeyword<Provider, Database>(utils.setEvent('Imposibleadivinar'))
    .addAnswer('¡Bienvenido, nuevo name!', { media: resolve(process.cwd(), 'assets', 'WhatsApp Video 2024-07-21 at 3.33.59 PM.mp4') })
    .addAnswer('¿Estás interesado en seguir el proceso con Banqi? Responde con "Sí" o "No".', { capture: true }, async (ctx, { flowDynamic, state }) => {
        const name = state.get('name') || 'cliente'; // Use the name from the state
        if (ctx.body.toLowerCase() === 'sí' || ctx.body.toLowerCase() === 'si') {
            await flowDynamic(`¡Genial, ${name}! Vamos a continuar con el proceso.`);
            // Aquí puedes agregar más pasos del flujo si es necesario
        } else if (ctx.body.toLowerCase() === 'no') {
            await flowDynamic(`Entendido, ${name}. Si cambias de opinión, estamos aquí para ayudarte.`);
        }
    });

// const registerFlow = addKeyword<Provider, Database>(utils.setEvent('REGISTER_FLOW'))
//     .addAnswer(`What is your name?`, { capture: true }, async (ctx, { state }) => {
//         await state.update({ name: ctx.body })
//     })
//     .addAnswer('What is your age?', { capture: true }, async (ctx, { state }) => {
//         await state.update({ age: ctx.body })
//     })
//     .addAction(async (_, { flowDynamic, state }) => {
//         await flowDynamic(`${state.get('name')}, thanks for your information!: Your age: ${state.get('age')}`)
//         await console.log(`${state.get('name')}, thanks for your information!: Your age: ${state.get('age')}`)
//     })

const fullSamplesFlow = addKeyword<Provider, Database>(['samples', utils.setEvent('SAMPLES')])
    .addAnswer(`💪 I'll send you a lot files...`)
    .addAnswer(`Send image from Local`, { media: join(process.cwd(), 'assets', 'sample.png') })
    .addAnswer(`Send video from URL`, {
        media: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTJ0ZGdjd2syeXAwMjQ4aWdkcW04OWlqcXI3Ynh1ODkwZ25zZWZ1dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LCohAb657pSdHv0Q5h/giphy.mp4',
    })
    .addAnswer(`Send audio from URL`, { media: 'https://cdn.freesound.org/previews/728/728142_11861866-lq.mp3' })
    .addAnswer(`Send file from URL`, {
        media: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    })

const main = async () => {
    const adapterFlow = createFlow([welcomeFlow, welcomeNewClientFlow])
    
    const adapterProvider = createProvider(Provider)
    const adapterDB = new Database()

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    adapterProvider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            const { number, message, urlMedia } = req.body
            
            // Check for the keyword "Nuevo cliente"
            if (message.includes('Nuevo cliente')) {
                await bot.dispatch('Imposibleadivinar', { from: number, name: 'seb' }); // Add a default name
                return res.end('welcome flow triggered');
            }
            
            await bot.sendMessage(number, message, { media: urlMedia ?? null });
            return res.end('sended');
        })
    )

    adapterProvider.server.post(
        '/v1/register',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('REGISTER_FLOW', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/samples',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('SAMPLES', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/blacklist',
        handleCtx(async (bot, req, res) => {
            const { number, intent } = req.body
            if (intent === 'remove') bot.blacklist.remove(number)
            if (intent === 'add') bot.blacklist.add(number)

            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ status: 'ok', number, intent }))
        })
    )

    httpServer(+PORT)
}

main()
