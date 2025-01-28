import React from 'react'
import SignIn from './CommonPages/SignIn'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import SuperAdminDashboard from './Superadmin/Pages/SuperAdminDashboard'
import Invoice from './Shopkeeper/Pages/Invoice'
import UploadExcel from './Shopkeeper/Pages/UploadExcel'
import UserDetails from './Shopkeeper/Pages/UserDetails'
import Executive from './Shopkeeper/Pages/Executive'
import Customers from './Shopkeeper/Pages/Customers'
import TransactionList from './Shopkeeper/Pages/TransactionList'
import AddTransaction from './Shopkeeper/Pages/AddTransaction'
import Dashboard from './Shopkeeper/Pages/Dashboard'
const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          {/* superadmin */}
          <Route path='/SuperAdminDashboard' element={<SuperAdminDashboard/>}></Route>
          {/* shopkeeper */}
          <Route path='/Dashboard' element={<Dashboard/>}></Route>
          <Route path='/Invoice' element={<Invoice/>}></Route>
          <Route path='/Customers' element={<Customers/>}></Route>
          <Route path='/TransactionList' element={<TransactionList/>}></Route>
          <Route path='/AddTransaction' element={<AddTransaction/>}></Route>
          <Route path='/UploadExcel' element={<UploadExcel/>}></Route>
          <Route path='/UserDetails' element={<UserDetails/>}></Route>
          <Route path='/Executive' element={<Executive/>}></Route>
          {/* login page */}
          <Route path='/' element={<SignIn/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}
export default App