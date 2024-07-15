
let data;
let myChart;

//Función para obtener datos desde la API.
async function obtencionDatos() {
    try {
        const res = await fetch('https://mindicador.cl/api');
        if (!res.ok) {
            throw new Error('No se logró la obtención de los datos solicitados');
        }
        data = await res.json();
        return data;
    } catch (error) {
        console.error('Error al consultar los datos:', error);
        document.querySelector('#resultado').innerHTML = `<span class="error">Error al consultar los datos</span>`;
        throw error; // Propagar el error de ser necesario.-
    }
}

//Función para convertir el valor ingresado a la moneda seleccionada.
async function conversionValor() {
    try {
        const valorInput = document.querySelector('#valor').value;
        const monedaSeleccionada = document.querySelector('#moneda').value;

        // Validar entrada de valor
        const valor = parseFloat(valorInput);
        if (isNaN(valor) || valor <= 0) {
            throw new Error('Ingrese un valor numérico válido');
        }

        // Obtener datos de la API
        await obtencionDatos();

        //Validación respecto a que la moneda seleccionada se encuentre dentro de los datos obtenidos.
        if (!data[monedaSeleccionada]) {
            throw new Error('Moneda seleccionada no disponible');
        }

        //Calculo del valor convertido.
        const valorMoneda = data[monedaSeleccionada].valor;
        const valorConvertido = valor / valorMoneda;

        //Visualizar símbolo de la moneda seleccionada.
        let simboloMoneda;
        switch (monedaSeleccionada) {
            case 'uf':
                simboloMoneda = 'UF';
                break;
            case 'dolar':
                simboloMoneda = '$';
                break;
            case 'euro':
                simboloMoneda = '€';
                break;
            default:
                simboloMoneda = '';
        }

        //Actualización de la interfaz con resultado obtenido.
        document.querySelector('#resultado').innerHTML = `<span>Resultado: ${simboloMoneda} ${valorConvertido.toFixed(2)}</span>`;

        //Creación o actualización del gráfico (en caso de cambio de moneda a convertir).
        await creacionGrafico(monedaSeleccionada);
    } catch (error) {
        console.error('Error al convertir valor:', error);
        document.querySelector('#resultado').innerHTML = `<span class="error">Error al convertir monto ingresado, intente nuevamente</span>`;
    }
}

//Función para crear o actualizar el gráfico con los datos de la moneda seleccionada.
async function creacionGrafico(moneda) {
    try {
        //Obtención datos históricos desde la API.
        const res = await fetch(`https://mindicador.cl/api/${moneda}`);
        if (!res.ok) {
            throw new Error('No se logró la obtención de datos históricos');
        }
        const data = await res.json();

        //Extracción de fechas los valores de la moneda seleccionada.
        const fechas = data.serie.map(item => item.fecha.split('T')[0]);
        const valores = data.serie.map(item => item.valor);

        //Extracción últimos 10 valores.
        const diezFechas = fechas.slice(0, 10).reverse();
        const diezValores = valores.slice(0, 10).reverse();

        //Selección del área de gráfico y limpieza previa, de existir.
        const grafico = document.querySelector('#grafico');
        grafico.innerHTML = `<canvas id="graficofMonedas" class="graficoMoneda"></canvas>`;
        const ctx = document.querySelector('#graficofMonedas').getContext('2d');
        if (myChart) {
            myChart.destroy(); //Destruir instancia previa del gráfico, de existir.-
        }

        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: diezFechas,
                datasets: [{
                    label: `Valor de la moneda en ${moneda}`,
                    data: diezValores,
                    borderColor: '#8BB8E5',
                    pointBackgroundColor: '#0D3E6F',
                    pointBorderColor: 'black'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { beginAtZero: false },
                    y: { beginAtZero: false }
                }
            }
        });
    } catch (error) {
        console.error('Error al crear gráfico:', error);
        document.querySelector('#resultado').innerHTML = `<span class="error">Error al crear gráfico</span>`;
    }
}


