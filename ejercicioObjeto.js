/**
 * @param {object} recipe donde listaremos nuestras tareas. Todas inician el false, conforme las completemos se volverán 'true'
 */
let recipe = {
    lavarArroz: false,
    hervirArroz: false,
    picarCondimentos: false,
    calentarSarten: false,
    agregarAceite: false,
    freirArroz: false,
    agregarCondimentos: false,
    agregarAgua: false,
    mezclar: false,
    coccion: false
}


function imprimirRecipe(params){
    console.log(params);
}

function imprimirMensaje(mensaje,)
    {
        return new Promise((res)=>{
            console.log(mensaje);
            res();}

)}

function lavarArroz(){
// promesa que nos ayudará a lavar el arroz. No depende de nada
    return new Promise ((res) => {
        console.log(`>>>LAVANDO ARROZ...\n ...`);
        setTimeout(() => {
            console.log(`---arroz lavado!---`)
            res(recipe.lavarArroz = true);
        }, 3000);
    });

}

function hervirArroz(){
/**
 * Depende:
 * 1.LavarArroz
 */ if (recipe.lavarArroz === true){
    return new Promise ((res) => {
        console.log('>>>PONIENDO A HERVIR EL ARROZ...\n ...')
        setTimeout(() => {
            console.log(`---el arroz terminó de hervir---`)
            res(recipe.hervirArroz = true)
        }, 5000);
    })
}
}

function picarCondimentos(){
    /**
     * Función para picar condimentos, no depende de nada.
     */
    return new Promise (  (res) => {
        console.log(`>>>PICANDO CONDIMENTOS...\n ...`)
        setTimeout(() => {
            recipe.picarCondimentos = true
            console.log(`---Condimentos picados---`)
            res();
        }, 5000);
    }
)
}


function calentarSarten(){
    /**
     *Función para calentar sarten. No depende de nada
     */
    return new Promise((res) => {
        console.log(`>>>CALENTANDO SARTEN...\n ...`)
        setTimeout(() => {
            recipe.calentarSarten = true;
            console.log(`---sarten caliente---`)
            res();
        }, 4000);
    })
}


function agregarAceite(){
    /**
     * Función para agregar aceite.
     * Depende de:
     * 1. CalentarSarten
     */
    return new Promise((res) => {
        if (recipe.calentarSarten === true){
            console.log(`>>>AGREGANDO ACEITE...\n ...`)
            setTimeout(() => {

                recipe.agregarAceite = true;
                console.log(`---se agregó el aceite---`)
                res();

            }, 2000);
        }
    })
}


function freirArroz(){
    /**
     * Funcion para freir arroz depende de:
     * 1.Lavado arroz
     * 2.Agregar Aceite
     */

    return new Promise((res)=>{
        if (recipe.lavarArroz == true && recipe.agregarAceite == true){
            console.log(`>>>FRIENDO EL ARROZ...\n ...`)
            setTimeout(() => {
                recipe.freirArroz = true;
                console.log(`---se ah freido el arroz---`)
                res();
            }, 5000);
        }
    })
}


function agregarCondimentos(){
    /**
     * Funcion para agregar condimentos.
     *Depende de:
     1.PicarCondimentos()
     2.FreirArroz()
     */
    return new Promise((res) => {
        console.log(`>>>AGREGANDO CONDIMENTOS...\n ...`);
        if (recipe.picarCondimentos === true && recipe.freirArroz === true){
            setTimeout(() => {
                recipe.agregarCondimentos = true;
                console.log(`---se agregaron los condimentos---`);
                res();
            }, 2000);
        }
    })
}


function agregarAgua(){
    /**
     * Funcion para agregar agua
     * Depende de:
     * 1. agregarCondimentos
     */
    return new Promise((res)=>{
        if (recipe.agregarCondimentos === true){
            console.log(`>>>AGREGANDO AGUA...\n ...`)
            setTimeout(() => {
                recipe.agregarAgua = true;
                console.log(`---el agua fue agregada---`);
                res();
            }, 2000);
        }
    })
}


function mezclar(){
    /**
     * Funcion para mezclar. Depende de:
     * 1.AgregarAgua
     */
    return new Promise((res) => {
        if (recipe.agregarAgua === true){
            console.log(`>>>MEZCLANDO...\n ...`)
            setTimeout(() => {
                recipe.mezclar = true;
                console.log(`---Se mezcló correctamente---`);
                res();
            }, 4000);
        }
    })
    console.log(`>>>Mezclando...`);
    return recipe.mezclar = true;
}

function coccion(){
    /**
     * Sirve para cocer nuestro arroz depende de:
     * 1. Mezclar
     */
    return new Promise((res)=>{
        console.log(`>>>COCIENDO...\n ...`)
        if (recipe.mezclar == true){
            setTimeout(() => {
                recipe.coccion = true;
                console.log(`---coccion completa---`)
                res();
            }, 25000);
        }
    })
    console.log(`>>>Cociendo...`);
    return console.log(`>>>Felicidades! LLegaste al ultimo paso de la receta, tu arroz fue hecho con éxito...!`)
}

function esperar(tiempo){
    return new Promise( (res) => {

        tiempo = tiempo * 1000

        setTimeout(() => {
            res();
        }, tiempo);
        })
}

function final(params) {
    let params
    function iterarobjeto(params) {
        for (const key in params) {
            const value = params[key];
            if (value === false) {
                return false;
            }
        }
        return true;
    }

    if (iterarobjeto(params)) {
        console.log(`¡Con todos nuestros pasos hechos, gracias por cocinar con nosotros! Vuelve pronto por más arroz.`);
    } else {
        console.log(`¡Faltaron pasos por hacer!`);
    }
}


async function main(){
    try {
        Promise.all([
            await imprimirMensaje(`¡Empecemos a hacer un arroz muy especial!\n ...`),await esperar(3),
            await lavarArroz(), await esperar(2),
            await hervirArroz(), await esperar (2),
            await imprimirMensaje(`Procesos completos para empezar a empezar con los condimentos...`), await esperar(3),
            await picarCondimentos(), await esperar(2),
            await imprimirMensaje(`Empezando con la sartén...`), await esperar(3),
            await calentarSarten(), await esperar(2),
            await agregarAceite(), await esperar(2),
            await imprimirMensaje(`Es el momento de agregar nuestro arroz lavado...`),await(3),
            await freirArroz(),await esperar(2),
            await agregarCondimentos(),await esperar(2),
            await agregarAgua(), await esperar(2),
            await mezclar(),await esperar(2),
            await coccion(), await esperar(3),
        ])  

        final(recipe);
    }
    catch(err) {
        console.error(err)
    }
}


main();