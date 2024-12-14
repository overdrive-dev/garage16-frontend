const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Log inicial com timestamp
console.log(`[${new Date().toISOString()}] Iniciando configuração da loja`);

const storeSettings = {
  weekDays: {
    dom: { active: false, slots: [] },
    seg: { 
      active: true, 
      slots: ["00:00","01:00","02:00","03:00","04:00","05:00","06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"]
    },
    ter: { 
      active: true, 
      slots: ["00:00","01:00","02:00","03:00","04:00","05:00","06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"]
    },
    qua: { 
      active: true, 
      slots: ["00:00","01:00","02:00","03:00","04:00","05:00","06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"]
    },
    qui: { 
      active: true, 
      slots: ["00:00","01:00","02:00","03:00","04:00","05:00","06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"]
    },
    sex: { 
      active: true, 
      slots: ["00:00","01:00","02:00","03:00","04:00","05:00","06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"]
    },
    sab: { active: false, slots: [] }
  },
  blockedDates: ["2024-01-25"]
};

db.collection('storeSettings').doc('default').set(storeSettings)
  .then(() => {
    console.log(`[${new Date().toISOString()}] Configurações da loja salvas com sucesso!`);
    console.log('[DEBUG] Estrutura final salva:', JSON.stringify(storeSettings, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error(`[${new Date().toISOString()}] Erro ao salvar configurações:`, error);
    console.error('[DEBUG] Estado das configurações no momento do erro:', JSON.stringify(storeSettings, null, 2));
    process.exit(1);
  });