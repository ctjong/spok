import React, { Component } from 'react';
import TitleImg from '../../images/title.png';
import ViewModel from '../../view-model';
import './title.css';

class Title extends Component
{
    handleClick()
    {
        ViewModel.goTo("/");
    }

    render() 
    {
        return (
            <img src={TitleImg} alt="SPOK" className={"title " + (this.props.isLarge ? "title-large" : "title-small")} 
                onClick={() => this.handleClick()}/>
        );
    }
}

export default Title;