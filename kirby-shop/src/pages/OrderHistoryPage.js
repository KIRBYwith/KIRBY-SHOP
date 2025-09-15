import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import '../styles/EcommercePages.css';

const ORDERS_LIST_KEY = 'kirby-shop-orders';

const OrderHistoryPage = () => {
  let orders = [];
  try {
    const saved = localStorage.getItem(ORDERS_LIST_KEY);
    orders = saved ? JSON.parse(saved) : [];
  } catch (_) {}

  return (
    <>
      <Header />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
        <h2 style={{ marginBottom: 16 }}>주문내역</h2>
        {orders.length === 0 ? (
          <div>주문내역이 없습니다.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {orders.map((o) => (
              <div key={o.orderId} style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
                <div style={{ fontWeight: 700 }}>주문번호: {o.orderId}</div>
                <div style={{ color: '#666', marginBottom: 8 }}>주문일시: {new Date(o.createdAt || Date.now()).toLocaleString()}</div>
                <div>
                  {(o.items || []).slice(0, 3).map((it, idx) => (
                    <div key={idx}>{(it.product?.title || it.title) || '상품'} x {it.quantity || 1}</div>
                  ))}
                  {o.items && o.items.length > 3 && <div>외 {o.items.length - 3}개</div>}
                </div>
                <div style={{ marginTop: 8 }}>
                  총 결제금액: {(o.payable || 0).toLocaleString()}원 {o.discountAmount > 0 && <span style={{ color: '#28a745' }}>(할인 {o.discountAmount.toLocaleString()}원)</span>}
                </div>
                <div style={{ marginTop: 4, color: '#999' }}>상태: {o.status}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default OrderHistoryPage;


