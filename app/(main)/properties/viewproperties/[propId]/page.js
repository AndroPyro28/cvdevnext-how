import React from 'react'
import ViewProperty from './components/view-property-client'
import { getSession } from '@/actions/getCurrentSession'
import { redirect } from 'next/navigation'

const ViewPropertyPage = async () => {

    const session = await getSession()

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
