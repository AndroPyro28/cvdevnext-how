import React from 'react'
import ViewProperty from './components/view-property-client'
import { getSession } from '@/actions/getCurrentSession'

const ViewPropertyPage = async () => {

    const session = await getSession()

    console.log(session.user)
    if(!session || !session.user) {
      return redirect("/")
    }

  return (
    <>
        <ViewProperty userId={session.user.usr_id}/>
    </>
  )
}

export default ViewPropertyPage
