"use client"

import Script from 'next/script'
import React from 'react';

export default function WidgetVLibras() {

    return (
        <div className="">
        <div vw="true" className="enabled">
            <div vw-access-button="true" className="active"></div>
            <div vw-plugin-wrapper="true">
            <div className="vw-plugin-top-wrapper"></div>
            </div>
        </div>
        <Script src="https://vlibras.gov.br/app/vlibras-plugin.js"
        onReady={() => {
            setTimeout(()=>{
                window.VLibras && window.VLibras.Widget && new window.VLibras.Widget('https://vlibras.gov.br/app')
                window.onload?.()
            }, 2000)
            
        }} />

        </div>
    );
}