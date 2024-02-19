import Layout from '@/components/Layout'
import React from 'react'

const Error = () => {
    return (
        <Layout>
            <div className="py-5 text-center">
                <h2>Ooops! Somethin is wrong.</h2>
                <p className="lead">Couldn't process payment</p>
            </div>
        </Layout>
    )
}

export default Error
