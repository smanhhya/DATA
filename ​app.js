import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, getDoc, setDoc, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA4RYFUgB4Pz8SXizsKdnz8UU90nJiib9I",
  authDomain: "sman-data-fbad1.firebaseapp.com",
  projectId: "sman-data-fbad1",
  storageBucket: "sman-data-fbad1.firebasestorage.app",
  messagingSenderId: "469976194319",
  appId: "1:469976194319:web:4d50de87b9a361779db27a"
};

try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const totalEggsEl = document.getElementById('totalEggs');
    const freezerCountEl = document.getElementById('freezerCount');
    const totalSalesEl = document.getElementById('totalSales');
    const hatchDateMsg = document.getElementById('hatchDateMsg');

    // 1. الماكينة
    document.getElementById('addEggsBtn').addEventListener('click', async () => {
        const qty = parseInt(document.getElementById('eggCount').value);
        if (!qty) return alert("برجاء إدخال عدد البيض");

        const today = new Date();
        const hatchDate = new Date();
        hatchDate.setDate(today.getDate() + 17);

        try {
            await addDoc(collection(db, "incubator_batches"), {
                quantity: qty,
                insertDate: today.toISOString(),
                hatchDate: hatchDate.toISOString(),
                status: 'active'
            });
            hatchDateMsg.innerText = `✅ ميعاد الفقس: ${hatchDate.toLocaleDateString('ar-EG')}`;
            document.getElementById('eggCount').value = '';
            alert("تم التسجيل بنجاح!");
        } catch (e) { alert("❌ خطأ في قاعدة البيانات: تأكد من تفعيل Firestore Test Mode"); }
    });

    // 2. الفريزر
    async function updateFreezer(amount) {
        const freezerRef = doc(db, "inventory", "freezer");
        const snap = await getDoc(freezerRef);
        let currentCount = snap.exists() ? snap.data().count : 0;
        
        const newCount = currentCount + amount;
        if (newCount < 0) {
            alert("❌ الرصيد في الفريزر لا يكفي!");
            return false;
        }
        await setDoc(freezerRef, { count: newCount });
        return true;
    }

    document.getElementById('addFreezerBtn').addEventListener('click', async () => {
        const qty = parseInt(document.getElementById('freezerQty').value);
        if(qty) {
            await updateFreezer(qty);
            document.getElementById('freezerQty').value = '';
            alert("✅ تم إضافة الكمية للفريزر");
        } else {
            alert("برجاء إدخال الكمية أولاً");
        }
    });

    // 3. المبيعات
    document.getElementById('sellBtn').addEventListener('click', async () => {
        const qty = parseInt(document.getElementById('saleQty').value);
        const price = parseFloat(document.getElementById('salePrice').value);
        
        if (!qty || !price) return alert("برجاء إدخال الكمية والسعر");

        const success = await updateFreezer(-qty);
        if (success) {
            const today = new Date().toISOString().split('T')[0];
            await addDoc(collection(db, "sales"), { quantity: qty, price: price, total: qty * price, date: today });
            document.getElementById('saleQty').value = '';
            document.getElementById('salePrice').value = '';
            alert("✅ تم البيع وخصم الكمية");
        }
    });

    // 4. تحديث الأرقام لحظياً
    onSnapshot(doc(db, "inventory", "freezer"), (doc) => {
        freezerCountEl.innerText = doc.exists() ? doc.data().count : 0;
    });

    onSnapshot(collection(db, "incubator_batches"), (snapshot) => {
        let total = 0;
        snapshot.forEach((doc) => { if(doc.data().status === 'active') total += doc.data().quantity; });
        totalEggsEl.innerText = total;
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const salesQuery = query(collection(db, "sales"), where("date", "==", todayStr));
    onSnapshot(salesQuery, (snapshot) => {
        let dailyTotal = 0;
        snapshot.forEach((doc) => { dailyTotal += doc.data().total; });
        totalSalesEl.innerText = dailyTotal;
    });

} catch (error) {
    alert("❌ مشكلة في الأكواد الأساسية: " + error.message);
}
