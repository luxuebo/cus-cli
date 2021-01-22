import 'antd/dist/antd.css'
import React from 'react'
import ReactDom from 'react-dom'
import Title from './component/title'
class App extends React.Component{
    render(){
        return(
            <div>
                <Title />
            </div>
        )
    }
}
ReactDom.render(
    <App />,
    document.getElementById('react-app')
)

