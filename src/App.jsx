import { useState, useEffect } from "react"
import "./App.css"

const categories = [
  "🥩 อาหาร",
  "🧊 น้ำแข็ง",
  "🥬 ผัก",
  "🥤 เครื่องดื่ม",
  "🥛 นม",
  "🛒 ของจิปาถะ"
]

const getToday = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function App() {
  const [showForm, setShowForm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [historyDate, setHistoryDate] = useState(getToday())
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState("")
  const [purchases, setPurchases] = useState(() => {
    const saved = localStorage.getItem("startBarPurchases")
    return saved ? JSON.parse(saved) : []
  })
  
  useEffect(() => {
    localStorage.setItem("startBarPurchases", JSON.stringify(purchases))
  }, [purchases])

  const [paymentMethod, setPaymentMethod] = useState("")
  const [editingIndex, setEditingIndex] = useState(null)
  const [purchaseDate, setPurchaseDate] = useState(getToday())

  const total = Number(price) || 0
  const todayTotal = purchases.reduce(
    (sum, purchase) => sum + purchase.price,
    0
  )

  const historyPurchases = purchases.filter(
    (purchase) => purchase.date === historyDate
  )

  const historyTotal = historyPurchases.reduce(
    (sum, purchase) => sum + Number(purchase.price || 0),
    0
  )

  const historyCash = historyPurchases
    .filter((purchase) => purchase.paymentMethod === "เงินสด")
    .reduce((sum, purchase) => sum + Number(purchase.price || 0), 0)

  const historyTransfer = historyPurchases
    .filter((purchase) => purchase.paymentMethod === "โอน")
    .reduce((sum, purchase) => sum + Number(purchase.price || 0), 0)

  const savePurchase = () => {
    if (!category || !price || !paymentMethod) {
      alert("กรุณากรอกข้อมูลให้ครบ")
      return
    }

    const newPurchase = {
      category,
      price: total,
      date: purchaseDate,
      paymentMethod
    }

    if (editingIndex !== null) {
      const updatedPurchases = [...purchases]
      updatedPurchases[editingIndex] = newPurchase
      setPurchases(updatedPurchases)
    } else {
      setPurchases([newPurchase, ...purchases])
    }

    setCategory("")
    setPrice("")
    setPurchaseDate(getToday())
    setPaymentMethod("")
    setEditingIndex(null)
    setShowForm(false)
  }

  // ฟังก์ชันสำรองข้อมูล (Export JSON)
  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(purchases))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", `start_bar_backup_${getToday()}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  // ฟังก์ชันกู้คืนข้อมูล (Import JSON)
  const importData = (e) => {
    const fileReader = new FileReader()
    if (e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8")
      fileReader.onload = (event) => {
        try {
          const parsedData = JSON.parse(event.target.result)
          if (Array.isArray(parsedData)) {
            setPurchases(parsedData)
            alert("กู้คืนข้อมูลสำเร็จแล้วจ้า!")
          } else {
            alert("รูปแบบไฟล์ไม่ถูกต้อง")
          }
        } catch (error) {
          alert("ไม่สามารถอ่านไฟล์นี้ได้")
        }
      }
    }
  }

  return (
    <div className="app-container">
      <div className="app-content">

        <img
          src="/logo_circle.png"
          alt="START BAR"
          className="app-logo"
        />

        <h1>จัดซื้อ START BAR</h1>

        <button
          onClick={() => {
            setShowForm(true)
            setShowHistory(false)
          }}
        >
          ＋ เพิ่มรายการซื้อ
        </button>

        <button
          onClick={() => {
            setShowHistory(true)
            setShowForm(false)
          }}
        >
          📋 ประวัติการซื้อ
        </button>

        {showForm && (
          <div className="form-card">
            <h2>เพิ่มรายการซื้อ</h2>
            <label>วันที่ซื้อ</label>
            <br />
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />

            <br /><br />

            <label>หมวดสินค้า</label>
            <br />
            <div className="category-grid">
              {categories.map((name) => {
                const parts = name.split(" ");
                const icon = parts.shift();
                const label = parts.join(" ");

                return (
                  <button
                    type="button"
                    key={name}
                    className={`category-card ${
                      category === name ? "selected" : ""
                    }`}
                    onClick={() => {
                      setCategory(name);
                    }}
                  >
                    <div className="category-icon">{icon}</div>
                    <div className="category-name">{label}</div>
                  </button>
                );
              })}
            </div>

            <br /><br />

            <label>ราคารวม</label>
            <br />
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="เช่น 350"
            />

            <br /><br />

            <strong>💰 ยอดซื้อ: {total.toLocaleString()} บาท</strong>
            <br /><br />
            <label>วิธีชำระเงิน</label>
            <br />

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="">-- เลือกวิธีชำระเงิน --</option>
              <option value="เงินสด">💵 เงินสด</option>
              <option value="โอน">🏦 โอน</option>
            </select>

            <br /><br />

            <button onClick={savePurchase}>
              💾 บันทึกการซื้อ
            </button>

            <button onClick={() => setShowForm(false)}>
              ยกเลิก
            </button>

          </div>
        )}

        {showHistory && (
          <div className="history-card">

            <h2 className="history-title">
              📋 ประวัติการซื้อ
            </h2>

            <label className="history-date-label">
              เลือกวันที่
            </label>

            <input
              className="history-date-input"
              type="date"
              value={historyDate}
              onChange={(e) => setHistoryDate(e.target.value)}
            />

            <div className="history-day-header">
              <div>
                📅 รายการวันที่ {historyDate}
              </div>

              <span>
                ทั้งหมด {historyPurchases.length} รายการ
              </span>
            </div>

            {historyPurchases.length === 0 ? (
              <div className="history-empty">
                <div>📭</div>
                <p>ไม่มีรายการซื้อในวันนี้</p>
              </div>
            ) : (
              <div className="history-list">

                {historyPurchases.map((purchase, index) => (
                  <div className="history-item" key={index}>

                    <div className="history-number">
                      {index + 1}
                    </div>

                    <div className="history-category">
                      {purchase.category}
                    </div>

                    <div className="history-price">
                      {Number(purchase.price).toLocaleString()} บาท
                    </div>

                    <div
                      className={`history-payment ${
                        purchase.paymentMethod === "เงินสด"
                          ? "cash"
                          : "transfer"
                      }`}
                    >
                      {purchase.paymentMethod === "เงินสด"
                        ? "💵 เงินสด"
                        : "🏦 โอน"}
                    </div>

                  </div>
                ))}

              </div>
            )}

            {historyPurchases.length > 0 && (
              <div className="history-summary">

                <div className="summary-total">
                  <span>💰 ยอดรวมทั้งหมด</span>
                  <strong>
                    {historyTotal.toLocaleString()} บาท
                  </strong>
                </div>

                <>
                  <div className="summary-box cash-box">
                    <span>💵 เงินสด</span>
                    <strong>
                      {historyCash.toLocaleString()} บาท
                    </strong>
                  </div>

                  <div className="summary-box transfer-box">
                    <span>🏦 โอน</span>
                    <strong>
                      {historyTransfer.toLocaleString()} บาท
                    </strong>
                  </div>
                </>

              </div>
            )}
          </div>
        )}

        {/* ย้ายปุ่มสำรองและกู้คืนข้อมูลมาไว้ล่างสุดตรงนี้ */}
        <div style={{ margin: "30px 0 15px 0", display: "flex", gap: "10px", justifyContent: "center" }}>
          <button onClick={exportData} style={{ fontSize: "14px", padding: "8px 12px", background: "#4CAF50", color: "#fff", border: "none", borderRadius: "8px" }}>
            📥 สำรองข้อมูล
          </button>
          
          <label style={{ fontSize: "14px", padding: "8px 12px", background: "#2196F3", color: "#fff", borderRadius: "8px", cursor: "pointer", display: "inline-block" }}>
            📤 กู้คืนข้อมูล
            <input type="file" accept=".json" onChange={importData} style={{ display: "none" }} />
          </label>
        </div>

      </div>
    </div>
  )
}

export default App