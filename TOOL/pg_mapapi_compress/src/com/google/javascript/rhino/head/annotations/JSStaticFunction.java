package com.google.javascript.rhino.head.annotations;

import java.lang.annotation.*;

/**
 * An annotation that marks a Java method as JavaScript static function. This can
 * be used as an alternative to the <code>jsStaticFunction_</code> prefix desribed in
 * {@link com.google.javascript.rhino.head.ScriptableObject#defineClass(com.google.javascript.rhino.head.Scriptable, java.lang.Class)}.
 */
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface JSStaticFunction {
    String value() default "";
}
