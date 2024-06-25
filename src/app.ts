import { join } from 'path'
import { createBot, createProvider, createFlow, addKeyword, utils } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { recordatorio } from './complements/envio.js'

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

const learnbanqi = addKeyword<Provider, Database>('1').addAnswer('Banqi es la revolucion de los bancos un banco para la gente donde tu dinero va a personas como tu como yo y los intereses son principalmente para ti y no para banqui, conservamos una pequeña comision por funcionamiento pero los intereses seran 99% tuyos')

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


const welcomeFlow = addKeyword<Provider, Database>(['frasesecretainadivinable'])
    .addAnswer(`🙌 Hola bienvenido a banqi!! en que te puedo ayudar el dia de hoy`)
    .addAnswer(
        [
            '1. Quiero aprender de banqi',
            '2. Quiero registrarme en banqui',
            '3. Cual es mi saldo en banqi',
            // '4. Dame un recordatorio',
        ].join('\n'),
        { delay: 800, capture: true },
        async (ctx, { fallBack, gotoFlow }) => {
            if (!['1', '2', '3', '4'].some(valor => ctx.body.toLocaleLowerCase().includes(valor))) {
                return fallBack('Debes escoger una de las opciones 1,2,3,4!')
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
            // if (ctx.body === '4'){
            //     return await recordatorio()
            // }
            return
        })

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
    const adapterFlow = createFlow([welcomeFlow])
    
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
            await bot.sendMessage(number, message, { media: urlMedia ?? null })
            return res.end('sended')
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
