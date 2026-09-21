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

const getCurrentMonth = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

function App() {
  const [showForm, setShowForm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [historyMode, setHistoryMode] = useState("day")
  const [historyDate, setHistoryDate] = useState(getToday())
  const [historyMonth, setHistoryMonth] = useState(getCurrentMonth())
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState("")
  const [note, setNote] = useState("")
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

  const historyPurchases = purchases.filter((purchase) => {
    if (!purchase.date) return false
    if (historyMode === "day") {
      return purchase.date === historyDate
    } else {
      return purchase.date.startsWith(historyMonth)
    }
  })

  const historyTotal = historyPurchases.reduce(
    (sum, purchase) => sum + Number(purchase.price || 0),
    0
  )

  // รวมยอดของแต่ละหมวดสินค้าในช่วงที่กำลังดู
  const historyCategoryTotals = categories.map((categoryName) => ({
    category: categoryName,
    total: historyPurchases
      .filter((purchase) => purchase.category === categoryName)
      .reduce((sum, purchase) => sum + Number(purchase.price || 0), 0)
  }))

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
      paymentMethod,
      note: note.trim()
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
    setNote("")
    setPurchaseDate(getToday())
    setPaymentMethod("")
    setEditingIndex(null)
    setShowForm(false)
  }

  // ปรับปรุงฟังก์ชันสำรองข้อมูลใหม่ ใช้ Blob ให้ดาวน์โหลดบนมือถือได้ชัวร์ 100%
  const exportData = () => {
    try {
      const dataStr = JSON.stringify(purchases, null, 2)
      const blob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      
      const downloadAnchor = document.createElement('a')
      downloadAnchor.href = url
      downloadAnchor.download = `start_bar_backup_${getToday()}.json`
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      
      setTimeout(() => {
        document.body.removeChild(downloadAnchor)
        URL.revokeObjectURL(url)
      }, 100)
    } catch (error) {
      alert("ไม่สามารถสำรองข้อมูลได้ กรุณาลองใหม่อีกครั้ง")
    }
  }

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
              style={{
                width: "88%",
                maxWidth: "520px",
                boxSizing: "border-box",
                display: "block",
                margin: "0 auto"
              }}
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

            <label>หมายเหตุ (ถ้ามี)</label>
            <br />
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น ซื้อเพิ่มที่แม็คโคร"
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", background: "#fff", color: "#333", boxSizing: "border-box" }}
            />

            <br /><br />

            <strong>💰 ยอดซื้อ: {total.toLocaleString()} บาท</strong>
            <br /><br />
            <label>วิธีชำระเงิน</label>
            <br />

            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <button
                type="button"
                onClick={() => setPaymentMethod("เงินสด")}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: paymentMethod === "เงินสด" ? "2px solid #22c55e" : "1px solid #ccc",
                  background: paymentMethod === "เงินสด" ? "#064e3b" : "#fff",
                  color: paymentMethod === "เงินสด" ? "#fff" : "#333",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "15px"
                }}
              >
                💵 เงินสด
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("โอน")}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: paymentMethod === "โอน" ? "2px solid #3b82f6" : "1px solid #ccc",
                  background: paymentMethod === "โอน" ? "#1e3a8a" : "#fff",
                  color: paymentMethod === "โอน" ? "#fff" : "#333",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "15px"
                }}
              >
                🏦 โอน
              </button>
            </div>

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

            <div style={{ display: "flex", gap: "8px", marginBottom: "15px" }}>
              <button
                type="button"
                onClick={() => setHistoryMode("day")}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "6px",
                  border: historyMode === "day" ? "2px solid #f59e0b" : "1px solid #ccc",
                  background: historyMode === "day" ? "#78350f" : "#1e293b",
                  color: "#fff",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "13px"
                }}
              >
                📅 ดูแบบรายวัน
              </button>

              <button
                type="button"
                onClick={() => setHistoryMode("month")}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "6px",
                  border: historyMode === "month" ? "2px solid #f59e0b" : "1px solid #ccc",
                  background: historyMode === "month" ? "#78350f" : "#1e293b",
                  color: "#fff",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "13px"
                }}
              >
                📊 ดูแบบรายเดือน
              </button>
            </div>

            {historyMode === "day" ? (
              <>
                <label className="history-date-label">เลือกวันที่</label>
                <input
                  className="history-date-input"
                  type="date"
                  value={historyDate}
                  onChange={(e) => setHistoryDate(e.target.value)}
                />
              </>
            ) : (
              <>
                <label className="history-date-label">เลือกเดือน</label>
                <input
                  className="history-date-input"
                  type="month"
                  value={historyMonth}
                  onChange={(e) => setHistoryMonth(e.target.value)}
                />
              </>
            )}

            <div className="history-day-header">
              <div>
                {historyMode === "day" ? `📅 รายการวันที่ ${historyDate}` : `📊 รายการประจำเดือน ${historyMonth}`}
              </div>

              <span>
                ทั้งหมด {historyPurchases.length} รายการ
              </span>
            </div>

            {historyPurchases.length === 0 ? (
              <div className="history-empty">
                <div>📭</div>
                <p>ไม่มีรายการซื้อในช่วงเวลานี้</p>
              </div>
            ) : (
              <div className="history-list">

                {historyPurchases.map((purchase, index) => (
                  <div className="history-item" key={index} style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px", width: "100%", boxSizing: "border-box" }}>
                    
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", fontSize: "12px", color: "#94a3b8", borderBottom: "1px dashed rgba(255,255,255,0.1)", paddingBottom: "4px" }}>
                      <span>📅 วันที่: {purchase.date}</span>
                      <span>#{index + 1}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                      <div className="history-category" style={{ fontSize: "15px", fontWeight: "bold", wordBreak: "break-word" }}>
                        {purchase.category}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                      <div className="history-price" style={{ fontSize: "16px", fontWeight: "bold" }}>
                        {Number(purchase.price).toLocaleString()} บาท
                      </div>

                      <div
                        className={`history-payment ${
                          purchase.paymentMethod === "เงินสด"
                            ? "cash"
                            : "transfer"
                        }`}
                        style={{ fontSize: "12px", padding: "4px 10px", flexShrink: 0 }}
                      >
                        {purchase.paymentMethod === "เงินสด"
                          ? "💵 เงินสด"
                          : "🏦 โอน"}
                      </div>
                    </div>

                    {purchase.note && (
                      <div style={{ fontSize: "13px", color: "#cbd5e1", background: "rgba(11, 60, 45, 0.6)", padding: "5px 10px", borderRadius: "6px", width: "100%", boxSizing: "border-box" }}>
                        📝 หมายเหตุ: {purchase.note}
                      </div>
                    )}

                  </div>
                ))}

              </div>
            )}

            {historyPurchases.length > 0 && (
              <div className="history-summary">

                {historyCategoryTotals
                  .filter((item) => item.total > 0)
                  .map((item) => (
                    <div
                      className="summary-box"
                      key={item.category}
                      style={{ border: "1px solid #22c55e" }}
                    >
                      <span>{item.category}</span>
                      <strong>
                        {item.total.toLocaleString()} บาท
                      </strong>
                    </div>
                  ))}

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