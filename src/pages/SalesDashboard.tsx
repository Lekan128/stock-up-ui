import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useLoading } from "../contexts/LoadingContext";
import { useNotification } from "../contexts/NotificationContext";
import "./SalesDashboard.css";

type SalesSummary = {
  totalQuantity: number;
  totalRevenue: number;
  totalProfit: number;
  excludedCount?: number;
};

type SaleView = {
  id: string;
  soldPrice: number;
  quantity: number;
  totalAmount: number;
  createdAt: string;
  product: { id: string; name: string };
};

type TopProductView = {
  productId: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
};
type ProductStockView = { id: string; name: string; numberAvailable: number };

const SalesDashboard: React.FC = () => {
  const { showLoading, hideLoading } = useLoading();
  const { showNotification } = useNotification();

  const [activeTab, setActiveTab] = useState<
    "summary" | "sales" | "top" | "stock"
  >("summary");

  // Summary
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);

  // Sales list
  const [sales, setSales] = useState<SaleView[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [hasMore, setHasMore] = useState(false);

  // Top products
  const [topProducts, setTopProducts] = useState<TopProductView[]>([]);
  const [topLimit, setTopLimit] = useState(5);

  // Low stock
  const [lowStock, setLowStock] = useState<ProductStockView[]>([]);
  const [stockThreshold, setStockThreshold] = useState(10);

  // On mount, fetch summary/top/low once. Subsequent fetches happen only on explicit Refresh
  useEffect(() => {
    // Fetch summary when dashboard mounts or date range changes
    fetchSummary();
    fetchTopProducts();
    fetchLowStock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch sales when Sales tab is active and page changes
  useEffect(() => {
    if (activeTab === "sales") fetchSales(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page]);

  const fetchSummary = async () => {
    showLoading();
    try {
      const params: Record<string, string> = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await axiosInstance.get("/sales/summary", { params });
      setSummary(res.data);
    } catch (err) {
      console.error(err);
      showNotification("Failed to load sales summary", "error");
    } finally {
      hideLoading();
    }
  };

  const fetchSales = async (pageNumber = 0) => {
    showLoading();
    try {
      const params: any = { page: pageNumber, size };
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await axiosInstance.get("/sales/filter", { params });
      // If backend returns a Page<SaleView> structure, try to pick content and total elements
      const data = res.data;
      if (data?.content) {
        setSales(data.content);
        setHasMore(pageNumber < data.totalPages - 1);
      } else if (Array.isArray(data)) {
        setSales(data);
        setHasMore(false);
      } else {
        setSales([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
      showNotification("Failed to load sales", "error");
    } finally {
      hideLoading();
    }
  };

  const fetchTopProducts = async () => {
    showLoading();
    try {
      const params: any = {};
      if (from) params.from = from;
      if (to) params.to = to;
      params.limit = topLimit;
      const res = await axiosInstance.get("/sales/top-products", { params });
      setTopProducts(res.data || []);
    } catch (err) {
      console.error(err);
      showNotification("Failed to load top products", "error");
    } finally {
      hideLoading();
    }
  };

  const fetchLowStock = async () => {
    showLoading();
    try {
      const params = { stockThreshold };
      const res = await axiosInstance.get("/sales/low-stock", { params });
      setLowStock(res.data || []);
    } catch (err) {
      console.error(err);
      showNotification("Failed to load low stock products", "error");
    } finally {
      hideLoading();
    }
  };

  // helpers for panel display + info popovers
  const [showProfitInfo, setShowProfitInfo] = useState(false);
  const [showExcludedInfo, setShowExcludedInfo] = useState(false);

  return (
    <div className="sales-dashboard main-container">
      <header className="sales-header">
        <div className="controls">
          <div className="date-controls">
            <label className={activeTab === "stock" ? "hidden" : ""}>
              From
              <input
                type="datetime-local"
                value={from ?? ""}
                onChange={(e) => setFrom(e.target.value || null)}
              />
            </label>
            <label className={activeTab === "stock" ? "hidden" : ""}>
              To
              <input
                type="datetime-local"
                value={to ?? ""}
                onChange={(e) => setTo(e.target.value || null)}
              />
            </label>
          </div>

          <button onClick={() => fetchSummary()} className="small">
            Refresh Summary
          </button>
        </div>
      </header>

      <nav className="sales-tabs">
        <button
          className={activeTab === "summary" ? "active" : ""}
          onClick={() => setActiveTab("summary")}
        >
          Summary
        </button>
        <button
          className={activeTab === "sales" ? "active" : ""}
          onClick={() => setActiveTab("sales")}
        >
          Sales
        </button>
        <button
          className={activeTab === "top" ? "active" : ""}
          onClick={() => setActiveTab("top")}
        >
          Top Products
        </button>
        <button
          className={activeTab === "stock" ? "active" : ""}
          onClick={() => setActiveTab("stock")}
        >
          Low Stock
        </button>
      </nav>

      <section className="sales-content">
        <div
          className={`panel ${activeTab === "summary" ? "active" : "hidden"}`}
        >
          <div className="summary-panel">
            <h3>Summary</h3>
            <div className="controls-inline">
              <button onClick={() => fetchSummary()} className="small">
                Refresh
              </button>
            </div>
            {summary ? (
              <div className="summary-cards">
                <div className="card">
                  <div className="label">Total Sales Quantity</div>
                  <div className="value">{summary.totalQuantity}</div>
                </div>
                <div className="card">
                  <div className="label">Total Revenue</div>
                  <div className="value">
                    ₦{summary.totalRevenue?.toLocaleString()}
                  </div>
                </div>
                <div className="card">
                  <div className="label">
                    Total Profit{" "}
                    <button
                      className="info"
                      onClick={() => setShowProfitInfo((s) => !s)}
                    >
                      i
                    </button>
                  </div>
                  <div className="value">
                    ₦{summary.totalProfit?.toLocaleString()}
                  </div>
                  {showProfitInfo && (
                    <div className="info-pop">
                      Total profit = sum(sellingPriceWhenSold -
                      costPriceWhenSold)
                    </div>
                  )}
                </div>
                {summary.excludedCount && summary.excludedCount > 0 && (
                  <div className="card">
                    <div className="label">
                      Excluded from profit{" "}
                      <button
                        className="info"
                        onClick={() => setShowExcludedInfo((s) => !s)}
                      >
                        i
                      </button>
                    </div>
                    <div className="value">{summary.excludedCount}</div>
                    {showExcludedInfo && (
                      <div className="info-pop">
                        Number of sales excluded from profit calculations
                        because cost or sold price was missing.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>No summary yet. Click Refresh.</div>
            )}
          </div>
        </div>

        <div className={`panel ${activeTab === "sales" ? "active" : "hidden"}`}>
          <div className="sales-list-panel">
            <h3>Sales</h3>
            <div className="controls-inline">
              <button onClick={() => fetchSales(0)} className="small">
                Refresh
              </button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Sold Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id}>
                    <td>{new Date(s.createdAt).toLocaleString()}</td>
                    <td>{s.product?.name ?? "—"}</td>
                    <td>{s.quantity}</td>
                    <td>₦{s.soldPrice.toLocaleString()}</td>
                    <td>₦{s.totalAmount.toLocaleString()}</td>
                  </tr>
                ))}
                {sales.length === 0 && (
                  <tr>
                    <td colSpan={5}>No sales found for the selected period.</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="pagination">
              <button
                className="pag-btn"
                onClick={() => {
                  setPage((p) => Math.max(0, p - 1));
                  fetchSales(Math.max(0, page - 1));
                }}
                disabled={page === 0}
              >
                ◀ Previous
              </button>
              <span>Page {page + 1}</span>
              <button
                className="pag-btn"
                onClick={() => {
                  setPage((p) => p + 1);
                  fetchSales(page + 1);
                }}
                disabled={!hasMore}
              >
                Next ▶
              </button>
            </div>
          </div>
        </div>

        <div className={`panel ${activeTab === "top" ? "active" : "hidden"}`}>
          <div className="top-products-panel">
            <h3>Top Products</h3>
            <div className="controls-inline">
              <label className="visible-control">
                Limit
                <input
                  type="number"
                  value={topLimit}
                  min={1}
                  max={50}
                  onChange={(e) => setTopLimit(Number(e.target.value))}
                />
              </label>
              <button onClick={fetchTopProducts} className="small">
                Refresh
              </button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Total Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((t) => (
                  <tr key={t.productId}>
                    <td>{t.productName}</td>
                    <td>{t.totalSold}</td>
                    <td>₦{t.totalRevenue.toLocaleString()}</td>
                  </tr>
                ))}
                {topProducts.length === 0 && (
                  <tr>
                    <td colSpan={3}>No data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`panel ${activeTab === "stock" ? "active" : "hidden"}`}>
          <div className="low-stock-panel">
            <h3>Low stock alerts</h3>
            <div className="controls-inline">
              <label className="visible-control">
                Threshold
                <input
                  type="number"
                  value={stockThreshold}
                  min={0}
                  onChange={(e) => setStockThreshold(Number(e.target.value))}
                />
              </label>
              <button onClick={fetchLowStock} className="small">
                Refresh
              </button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Available</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.numberAvailable}</td>
                  </tr>
                ))}
                {lowStock.length === 0 && (
                  <tr>
                    <td colSpan={2}>No low stock products</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SalesDashboard;
