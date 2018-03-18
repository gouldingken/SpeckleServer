'use strict'
const winston = require( 'winston' )
const chalk = require( 'chalk' )
const url = require( 'url' )
const User = require( '../../../models/User' )

module.exports = ( user, operation, resource ) => {
  return new Promise( ( resolve, reject ) => {

    if ( user == null ) user = { role: 'guest', _id: '' }
    winston.debug( chalk.bgRed( 'checking perms' ), user.role, user._id.toString( ), resource.streamId )

    // admin or owner
    if ( user.role === 'admin' || user._id.toString( ) === resource.owner.toString( ) ) {
      winston.debug( chalk.bgGreen( 'checking perms' ), 'user is admin or owner' )
      return resolve( )
    }

    if ( operation == null ) {
      winston.debug( chalk.bgRed( 'checking perms' ), 'no operation specified' )
      return reject( new Error( "You are not authorised." ) )
    }

    let canRead = resource.canRead.map( x => x.toString() )
    let canWrite = resource.canWrite.map( x => x.toString() )
    
    switch ( operation ) {
      case 'write':
        if ( canWrite.indexOf( user._id.toString( ) ) >= 0 ) {
          winston.debug( chalk.bgGreen( 'checking perms' ), `user has ${operation} access` )
          return resolve( )
        }
        winston.debug( chalk.bgRed( 'checking perms' ), `user has NO ${operation} access` )
        return reject( new Error( "You are not authorised." ) )

      case 'read':
        if ( !resource.private ) {
          winston.debug( chalk.bgGreen( 'checking perms' ), `${operation} ok, resource is public` )
          return resolve( )
        }
        if ( canWrite.indexOf( user._id.toString( ) ) >= 0 ) {
          winston.debug( chalk.bgGreen( 'checking perms' ), `user has write & ${operation} access` )
          return resolve( )
        }
        if ( canRead.indexOf( user._id.toString( ) ) >= 0 ) {
          winston.debug( chalk.bgGreen( 'checking perms' ), `user has ${operation} access` )
          return resolve( )
        }
        winston.debug( chalk.bgRed( 'checking perms' ), `user has NO ${operation} access` )
        return reject( new Error( "You are not authorised." ) )

      default:
        winston.debug( chalk.bgRed( 'checking perms' ), `operation ${operation} not defined` )
        return reject( new Error( "You are not authorised." ) )
    }
  } )
}