from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.database import get_db
from app.models import Sale

router = APIRouter()

class SaleCreate(BaseModel):
    unit_id: int
    price: float
    sale_date: date

@router.get("/api/sales")
def get_all_sales(db: Session = Depends(get_db)):
    sales = db.query(Sale).all()
    return {"count": len(sales), "sales": sales}

@router.get("/api/sales/{sale_id}")
def get_sale(sale_id: int, db: Session = Depends(get_db)):
    sale = db.query(Sale).filter(Sale.sale_id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale

@router.post("/api/sales")
def create_sale(sale: SaleCreate, db: Session = Depends(get_db)):
    new_sale = Sale(
        unit_id = Sale.unit_id,
        price = sale.price,
        sale_date = sale.sale_date
    )
    db.add(new_sale)
    db.commit()
    db.refresh(new_sale)
    return {"message": "Sale created successfully", "sale": new_sale}
