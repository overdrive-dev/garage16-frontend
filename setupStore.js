const admin = require('firebase-admin');
const serviceAccount = require('./garage16-e5cfc-firebase-adminsdk-i2ut2-a767736b32.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Configurações da loja
const storeSettings = {
  weekDays: {
    dom: { active: false, slots: [] },
    seg: { 
      active: true, 
      slots: ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"]
    },
    ter: { 
      active: true, 
      slots: ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"]
    },
    qua: { 
      active: true, 
      slots: ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"]
    },
    qui: { 
      active: true, 
      slots: ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"]
    },
    sex: { 
      active: true, 
      slots: ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"]
    },
    sab: { 
      active: true, 
      slots: ["09:00","10:00","11:00","12:00","13:00","14:00","15:00"]
    }
  },
  blockedDates: ["2024-01-25"]
};

// Função para calcular slots disponíveis para os próximos 3 meses
function calculateAvailableSlots() {
  const availableSlots = {};
  const today = new Date();
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

  // Array de dias da semana começando no domingo
  const diasSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];

  // Para cada dia nos próximos 3 meses
  for (let date = today; date <= threeMonthsFromNow; date.setDate(date.getDate() + 1)) {
    const dateStr = date.toISOString().split('T')[0];
    // Pega o dia da semana diretamente (0 = domingo, 6 = sábado)
    const dayIndex = date.getDay();
    const dayOfWeek = diasSemana[dayIndex];
    const dayConfig = storeSettings.weekDays[dayOfWeek];

    // Verifica se o dia está ativo e tem slots disponíveis
    if (dayConfig.active && dayConfig.slots.length > 0 && !storeSettings.blockedDates.includes(dateStr)) {
      availableSlots[dateStr] = {
        dayOfWeek,
        slots: dayConfig.slots
      };
    }
  }

  return availableSlots;
}

// Salva as configurações da loja e os slots disponíveis
async function setupStore() {
  try {
    // Salva as configurações da loja
    await db.collection('storeSettings').doc('default_store').set(storeSettings);
    console.log('Configurações da loja salvas com sucesso!');

    // Calcula e salva os slots disponíveis
    const availableSlots = calculateAvailableSlots();
    await db.collection('availableSlots').doc('default_store').set({
      slots: availableSlots,
      lastUpdate: new Date().toISOString()
    });
    console.log('Slots disponíveis calculados e salvos com sucesso!');

    process.exit(0);
  } catch (error) {
    console.error('Erro ao configurar a loja:', error);
    process.exit(1);
  }
}

// Executa a configuração
setupStore(); 