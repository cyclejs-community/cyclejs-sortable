import xs, { Stream } from 'xstream';
import { Transform } from './definitions';

/**
 * Can be composed with a Stream to make it start emitting when start$ fires and stop when stop$ fires
 * @param {Stream<any>} start$ the event stream to start emitting
 * @param {Stream<any>} stop$ the event stream to stop emitting
 * @returns {Transform<T, T>} a function to be composed with a Stream
 */
export function emitBetween<T>(start$ : Stream<any>, end$ : Stream<any>) : Transform<T, T> //TODO: implement a xstream operator and make a PR
{
    return s => xs.combine(s, start$.startWith(undefined), end$.startWith(undefined))
        .fold((acc, curr) => {
            const startChanged : boolean = curr[1] !== acc[2];
            const endChanged : boolean = curr[2] !== acc[3];
            const shouldEmit : boolean = startChanged ? true
                : (endChanged ? false : acc[0]);
            return [shouldEmit, curr[0], curr[1], curr[2]];
        }, [false, undefined, undefined, undefined])
        .filter(arr => arr[0])
        .map(arr => arr[1] as any as T); // sadly this hack is needed :(
}
