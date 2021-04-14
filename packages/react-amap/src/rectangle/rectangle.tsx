import React, { useRef, useEffect, useImperativeHandle } from 'react';
import { useMap } from '../map';
import { usePropsReactive } from '../hooks';
import type { RectangleProps, RectangleType } from './types';
import { allProps, setterMap, converterMap } from './config';

const Rectangle: RectangleType = (props = {}, ref) => {
  const { map } = useMap();
  const instanceObj = useRef<AMap.Rectangle>(null);

  const { loaded, onInstanceCreated } = usePropsReactive<AMap.Rectangle, RectangleProps>(
    props,
    instanceObj,
    {
      setterMap,
      converterMap
    }
  );

  useEffect(
    () => {
      if (map) {
        createInstance()
          .then(() => {
            onInstanceCreated?.(instanceObj.current)
          })
      }
    },
    [map]
  );

  useImperativeHandle(
    ref,
    () => instanceObj.current,
    [instanceObj.current]
  );

  const createInstance = () => {
    const options = buildCreateOptions()
    options.map = map;
    instanceObj.current = new window.AMap.Rectangle(options);
    return Promise.resolve();
  }

  const buildCreateOptions = () => {
    const options: AMap.Rectangle.Options = {}
    allProps.forEach((key) => {
      if (key in props) {
        if (key === 'style' && (props.style !== undefined)) {
          const styleItem = Object.keys(props.style)
          styleItem.forEach((item) => {
            options[item] = props.style[item]
          })
        } else if (key !== 'visible') {
          options[key] = getSetterValue(key, props)
        }
      }
    })
    return options;
  }

  /**
   * 处理需要转换的参数
   * @param key
   * @param props
   * @returns
   */
   const getSetterValue = (key: string, props: RectangleProps) => {
    if (key in converterMap) {
      return converterMap[key](props[key])
    }
    return props[key];
  }

  const renderEditor = (children: any) => {
    if (!children) {
      return null
    }
    if (React.Children.count(children) !== 1) {
      return null
    }
    return React.cloneElement(React.Children.only(children), {
      rectangle: instanceObj.current,
      map: map
    })
  }

  return loaded ? renderEditor(props.children) : null
}

export default React.forwardRef(Rectangle);
