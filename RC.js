import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Dimensions, PanResponder, Platform, StyleSheet, TouchableWithoutFeedback, Text, View } from 'react-native';

import {observer} from 'mobx-react'
import {observable} from 'mobx'

const l = x => console.log(x)

const web = Platform.OS=='web'

const body_style = {
    width:'100%',
    height:'100%',
    maxWidth:'100%',
    maxHeight:'100%',
    // overflowY:'hidden',
    overflowX:'hidden',
    overflow:'hidden',
    margin:0,
    padding:0,
    // overscrollBehavior:'contain',
    overscrollBehaviorX:'none',
    overscrollBehaviory:'none',
    position:'fixed',
    // touchAction:'pan-down'
    // border:'3px solid red',
    // boxSizing:'border-box',
    // webkitOverflowScrolling:'touch'
}

var pixel_size={};

const RC_setup_web = () => {
    let el = document.getElementsByTagName('html')[0]
    Object.assign(el.style, body_style)
    el = document.getElementsByTagName('body')[0]
    Object.assign(el.style,body_style)

    var get_pixel_size = () => el.getBoundingClientRect().width/100
    pixel_size = observable.box(get_pixel_size())
    window.addEventListener('resize',()=>pixel_size.set(get_pixel_size()))
}

const RC_setup_native = () => {
    let width = Dimensions.get('window').width
    pixel_size.get = () => width / 100
}

if(web){
    RC_setup_web()
} else {
    RC_setup_native()
}

const rc_default_props = {
    position:'absolute',
    transform:[
        {scaleX:1},
        {scaleY:1},
    ],
    boxSizing:'border-box',
    borderStyle:'solid',
    textAlign:'center',
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center',
    overflow:'hidden',
    userSelect:'none',
    overscrollBehavior:'none',

}
const rc_default_text_props = {
    position:'absolute',
    transform:[
        {scaleX:1},
        {scaleY:1},
    ],
    borderStyle:'solid',
    textAlign:'center',
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center',
    overflow:'hidden',
}

const rc_if_button_props = onClick => onClick ? {cursor:'pointer',userSelect:'none'} : {}

let to_pixels = x => x * pixel_size.get()

let with_state = x => x.replace(/^\$(\w+)?/,(_,x)=>state[x])

let xy_regx = /^xy-(\$\w+|\d{2})(\$\w+|\d{2})$/
let wh_regx = /^wh-(\$\w+|\d{2})(\$\w+|\d{2})$/
let bg_regx = /^bg-(\$\w+|\w+)$/
let br_regx = /^br-(\$\w+|\w+)(\$\w+|\d{2})(\$\w+|\d{2})$/
let tx_regx = /^tx-(\$\w+|\w+)(\$\w+|\d{2})$/

let bg_parse = ([_,x]) => x == undefined ? x : x == parseInt(x,16).toString(16) ? '#'+x : x
let br_parse = ([_,x,y,z]) => x == parseInt(x,16).toString(16) ? ['#'+x,y,z] : [x,y,z]

let wh_default = [null, '0', '0']
let xy_default = [null, '0', '0']
let br_default = [null, 'white', '0', '0']
let bg_default = [null, undefined]
let tx_default = [null, 'black', '12']

let rc_parse = _props => {
    let props = Object.keys(_props).filter(x=>_props[x] == true)
    let [_,width,height] = props.reduce((a,c)=> a ? a : c.match(wh_regx) ,null) || wh_default
    let [__,left,top] = props.reduce((a,c)=> a ? a : c.match(xy_regx) ,null) || xy_default
    let [___,color,fontSize] = props.reduce((a,c)=> a ? a : c.match(tx_regx) ,null) || tx_default
    let backgroundColor = bg_parse(props.reduce((a,c)=> a ? a : c.match(bg_regx) ,null) || bg_default)
    let [borderColor,borderWidth,borderRadius] = br_parse(props.reduce((a,c)=> a ? a : c.match(br_regx) ,null) || br_default)

    var style = {}

    style.width = to_pixels(with_state(width))
    style.height = to_pixels(with_state(height))
    style.top = to_pixels(with_state(top))
    style.left = to_pixels(with_state(left))
    style.color = with_state(color)
    style.fontSize = with_state(fontSize)
    if(backgroundColor){
        style.backgroundColor = with_state(backgroundColor)
    }
    if(borderWidth){
        style.borderWidth = parseInt(with_state(borderWidth))
        style.borderRadius = to_pixels(parseInt(with_state(borderRadius)))
        style.borderColor = with_state(borderColor)
    }
    return style
}

export var RC = observer( props => {
    const {onClick, children, style, text} = props
    return(
        <View
            style={{
                ...rc_parse(props),
                ...rc_default_props,
                ...rc_if_button_props(onClick),
                ...style      
            }}
            onClick={onClick}
            onTouchEnd={ web ? undefined : onClick }
        >
            {children}
            <Text>{text}</Text>
        </View>
    )
})

var clamp = (num,min,max) => Math.min(Math.max(min,num),max)

var useDrag = config => {
    var clampX = (config && config.clampX) ? config.clampX : undefined
    var clampY = (config && config.clampY) ? config.clampY : undefined
    var [offset,setOffset] = useState({x:0,y:0})
    var [last,setLast] = useState({x:0,y:0})
    var [start,setStart] = useState({x:0,y:0})
    var responder = PanResponder.create({
        onStartShouldSetPanResponder:x=>true,
        onStartShouldSetPanResponderCapture:x=>true,
        onMoveShouldSetPanResponder:x=>true,
        onMoveShouldSetPanResponderCapture:x=>true,
        onPanResponderStart:(e,g)=>{
            setLast(offset)
            setStart({x:e.nativeEvent.pageX, y:e.nativeEvent.pageY})
        },
        onPanResponderMove:(e,g)=>{
            let x = start.x + last.x - e.nativeEvent.pageX
            let y = start.y + last.y - e.nativeEvent.pageY
            setOffset({
                x: clampX ? clamp(x, clampX.min, clampX.max) : x,
                y: clampY ? clamp(y, clampY.min, clampY.max) : y
            })
        }
    })
    return([responder.panHandlers,offset])
}

export var Switch = observer( props => {
    var [on, setOn] = useState(false)
    const {width,height} = rc_parse(props)
    return(
        <RC {...props} br-black0100 onClick={()=>setOn(!on)} onPress={()=>l(press)}>
            <RC style={{
                ...rc_default_props,
                width:width/2,
                height,
                backgroundColor:'red',
                left: on ? width/2 : 0
            }}/>
        </RC>
    )
})

export var Fader = observer(props=>{
    var { height,width } = rc_parse(props)
    var [responder,offset] = useDrag({
        clampY:{
            max:height * 0.9,
            min:0
        }
    })
    var percent = ( offset.y / (height * 0.9) ) * 100
    return(
        <RC {...props} br-black0100>
            <View 
                style={{
                    ...rc_default_props,
                    ...rc_if_button_props(true),
                    top: height * 0.9 - offset.y,
                    height:height * 0.1,
                    width: to_pixels(width),
                    backgroundColor:'black'
                }}
                {...responder}
            >
                <Text style={{...rc_default_text_props,color:'white'}}>{percent.toFixed()}</Text>
            </View>
        </RC>
    )
})

export var Knob = observer(props=>{
    var [responder,offset] = useDrag({clampY:{min:-170,max:170}})
    const {width,height,top,left,borderRadius,borderColor,borderWidth,backgroundColor} = rc_parse(props)
    return(
        <View
            style={{
                ...rc_default_props,
                ...rc_if_button_props(true),
                width,height,top,left,borderRadius,borderWidth,borderColor,backgroundColor,
                transform:([{rotate:`${offset.y}deg`}])
            }}
            {...responder}
        >
            <View 
                style={{
                    ...rc_default_props,
                    width:to_pixels(2),
                    height:to_pixels(2),
                    borderRadius:to_pixels(2),
                    borderWidth:1,
                    borderColor:'black',
                    transform:([
                        {rotate:web ? '0deg' : `${offset.y}deg`},
                        {translateY:-(width/2 -2)}
                    ])
                }}
            />
            <Text 
                style={{
                    ...rc_default_text_props,
                    transform: web ? [] : ([{rotate:`${offset.y}deg`}])
                }}
            >
                {props.text}
            </Text>
        </View>
    )
})

// const c = "\u25a1"
const c = "\u25a2"
// const c = "\u2588"
// const c = "\u2B1c"
// const c = "\u258c"
// const c = "\u2590"
const hidden = {
    width:0,
    height:0,
    opacity:0
}

export var TextInput = observer(props => {
    const [txt, setTxt] = useState('')
    const [active, setActive] = useState(false)
    const input = useRef(null)
    const {onSubmit, onChange, placeholder} = props
    return (
        <RC 
            {...props} 
            style={ active?
                {border:"1px solid blue",color:'black'} :
                {border:'1px solid black',color:'grey'}
            }
            onClick={() => input.current.focus()}
            text={txt!='' ? active ? txt + c : txt : placeholder}
        >
            <form
                onSubmit={e=>{
                    e.preventDefault()
                    onSubmit && onSubmit(txt)
                    input.current.blur()
                    setTxt('')
                }}
                style={hidden}
            >
                <input
                    ref={input}
                    type='text'
                    value={txt}
                    onChange={e => {
                        setTxt(e.target.value)
                        onChange && onChange(e.target.value)
                    }}
                    onFocus={()=>setActive(true)}
                    onBlur={()=>setActive(false)}
                    style={hidden}
                />
                <input 
                    type='submit'
                    style={hidden}
                />
            </form>
        </RC>
    )
  })

export var Page = observer(props=>{
    if(props.name == props.current){
        return(<View style={{width:'100%',height:'100%',backgroundColor:props.backgroundColor}}>{props.children}</View>)
    } else {
        return(<View style={{display:'none'}}>{props.children}</View>)
    }
})

export var App = x => observer(x)

var state;
export var useFlux = s => {
    state = observable(s)
    return state
}