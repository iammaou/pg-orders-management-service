export interface Order {
    id: string,
    name: string,
    quantityGroups: QuantityGroup[],
    createdAt: string,
    deadline: string,
    status: number,
    totalPrice: number
}

export interface QuantityGroup{
    id: number,
    groupKey: string,
    quantities: Quantity[]
}

export interface Quantity{
    id: number,
    size: string,
    quantity: number
}

export interface NewOrder{
    name: string,
    quantityGroups: NewQuantityGroup[],
    deadline: string,
    totalPrice: number
}

export interface NewQuantityGroup{
    groupKey: string,
    quantities: NewQuantity[]
}

export interface NewQuantity{
    size: string,
    quantity: number
}

export interface EditOrder{
    name: string,
    quantityGroups: EditQuantityGroup[],
    deadline: string,
    createdAt: string,
    totalPrice: number,
    status: number
}

export interface EditQuantityGroup{
    id?: number
    groupKey: string,
    quantities: EditQuantity[]
}

export interface EditQuantity{
    size: string,
    quantity: number
}
