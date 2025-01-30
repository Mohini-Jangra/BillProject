import React, { useState } from 'react'

const AddProductModal = (props) => {
const[obj,setobj]= useState({})

function set(event){
setobj({...obj,[event.target.name]:event.target.value})
}
async function add(){
const response= fetch("https://localhost:4010/api/addproduct",{
    method:"post",
    body:JSON.stringify(obj),
    headers:{
        "Content-Type":"application/json"
    }
})
if(response.status===201){
    const result= await response.json()
    console.log(result)
    // alert(response.message)
    alert("Saved")
}
else{
    alert("error occured")
}
}
return (
        <div>
            <div class="modal-backdrop fade show"></div>
            <div className="modal fade show" style={{display:"block"}} id="addpaymentModal" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0">
                        <div className="modal-header p-4 pb-0">
                            <h5 className="modal-title" id="createMemberLabel">Add Product</h5>
                            <button type="button" onClick={add} className="btn-close" id="createMemberBtn-close" data-bs-dismiss="modal" aria-label="Close" />
                        </div>
                        <div className="modal-body p-4">
                            <form>
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="mb-3">
                                            <label htmlFor="Name" className="form-label">Name</label>
                                            <input onChange={set} type="text" className="form-control" id="Name" name='name' placeholder="Enter Name" />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="Name" className="form-label">Model</label>
                                            <input onChange={set} type="text" className="form-control" id="Name" name='model' placeholder="Enter Name" />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="Name" className="form-label">Description</label>
                                            <input onChange={set} type="text" className="form-control" id="Name" name='description' placeholder="Enter Name" />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="Name" className="form-label">Price</label>
                                            <input onChange={set} type="text" className="form-control" id="Name" name='price' placeholder="Enter Name" />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="Name" className="form-label">Rate</label>
                                            <input onChange={set} type="text" className="form-control" id="Name" name='rate' placeholder="Enter Name" />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="Name" className="form-label">Tax</label>
                                            <input onChange={set} type="text" className="form-control" id="Name" name='tax' placeholder="Enter Name" />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="paymentdetails" className="form-label">Discount</label>
                                            <textarea  className="form-control" name='discount' placeholder="Enter Payment Description" id="paymentdetails" defaultValue={""} />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="amount" className="form-label">Stock</label>
                                            <input onChange={set} type="number" className="form-control" id="amount" name='stock' placeholder="Enter Amount" />
                                        </div>
                                        <div className="hstack gap-2 justify-content-end">
                                            <button type="button" className="btn btn-light" onClick={()=>props.setToggle(false)} >Close</button>
                                            <button type="submit" className="btn btn-success" id="addNewMember">Add Product</button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddProductModal