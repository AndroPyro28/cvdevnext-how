import { getSession } from '@/actions/getCurrentSession'
import React from 'react'
import Statements from './billing-statements-client'

const page = async ({params}) => {

    const session = await getSession()

    console.log(session.user)
    if(!session || !session.user) {
      return redirect("/")
    }

  return (
    <div> 
      <Statements userId={session.user.usr_id} params={params}/>
    </div>
  )
}

export default page
