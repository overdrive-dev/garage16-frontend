const admin = require('firebase-admin');
const serviceAccount = require('./garage16-e5cfc-firebase-adminsdk-i2ut2-a767736b32.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

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

db.collection('storeSettings').doc('default').set(storeSettings)
  .then(() => {
    console.log('Configurações da loja salvas com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro ao salvar configurações:', error);
    process.exit(1);
  }); 