import React, { Component } from 'react';
import TitleImg from '../../images/title.png';
import Constants from '../../constants';
import Game from '../../game';
import './title.css';

class Title extends Component
{
    handleClick()
    {
        Game.goTo(Constants.HOME_PATH);
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