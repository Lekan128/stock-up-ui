import React, { useEffect, useRef, useState } from "react";
import "./SalesCart.css";
import clipBoardIcon from "../assets/icons/clipboard-icon.png";
import { Product } from "../model/types";

type Props = {
  cartCounts: Record<string, number>;
  products: Product[];
  onQuantityChange: (id: string | undefined, qty: number) => void;
  onSave: () => Promise<void>;
};

const SalesCart: React.FC<Props> = ({
  cartCounts,
  products,
  onQuantityChange,
  onSave,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const items = Object.entries(cartCounts)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => ({
      productId: id,
      qty,
      name: products.find((p) => String(p.id) === id)?.name ?? "Unknown",
    }));

  const distinctCount = items.length;
  const totalQuantity = items.reduce((s, it) => s + it.qty, 0);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <>
      <div className="sales-cart" ref={ref}>
        <button
          className="sales-cart-button"
          aria-label="Open cart"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
        >
          <img className="sales-cart-clip" src={clipBoardIcon} alt="Cart" />
          {distinctCount > 0 && (
            <span className="sales-cart-badge">{distinctCount}</span>
          )}
        </button>

        {open && (
          <div className="sales-cart-dropdown">
            <div className="sales-cart-dropdown-header">Products to record</div>
            <div className="sales-cart-items">
              {items.length === 0 && (
                <div className="empty">No items selected</div>
              )}
              {items.map((it) => (
                <div className="sales-cart-item" key={it.productId}>
                  <div className="item-name">{it.name}</div>
                  <div className="item-qty">{it.qty}</div>
                  <button
                    className="item-clear"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuantityChange(it.productId, 0);
                    }}
                    aria-label={`remove ${it.name}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="sales-cart-dropdown-footer">
              <div className="summary">
                {totalQuantity} total item{totalQuantity !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        )}
      </div>

      {distinctCount > 0 && (
        <div className="sales-save-bar">
          <div className="save-summary">
            {distinctCount} product{distinctCount !== 1 ? "s" : ""} selected •{" "}
            {totalQuantity} total
          </div>
          <button
            className="save-action"
            onClick={async (e) => {
              e.stopPropagation();
              await onSave();
              setOpen(false);
            }}
          >
            Record sales
          </button>
        </div>
      )}
    </>
  );
};

export default SalesCart;
