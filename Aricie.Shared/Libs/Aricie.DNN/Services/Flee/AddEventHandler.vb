Imports System.Reflection
Imports Aricie.DNN.ComponentModel
Imports System.ComponentModel
Imports Aricie.DNN.UI.Attributes
Imports Aricie.DNN.UI.WebControls.EditControls
Imports DotNetNuke.UI.WebControls
Imports System.Xml.Serialization
Imports Aricie.Services

Namespace Services.Flee
    ''' <summary>
    ''' Runs method as flee action
    ''' </summary>
    ''' <typeparam name="TObjectType"></typeparam>
    ''' <remarks></remarks>
    <DisplayName("Add Event Handler")> _
    <Serializable()> _
    Public Class AddEventHandler(Of TObjectType)
        Inherits ObjectAction(Of TObjectType)
        Implements ISelector(Of EventInfo)


        <ExtendedCategory("Instance")> _
        <Editor(GetType(SelectorEditControl), GetType(EditControl))> _
        <ProvidersSelector()> _
        Public Property EventName As String


        Public Property DelegateExpression As New FleeExpressionInfo(Of [Delegate])

        <XmlIgnore()> _
        <Browsable(False)> _
        Public Overrides Property Parameters As Variables
            Get
                Return Nothing
            End Get
            Set(value As Variables)
                'do nothing
            End Set
        End Property

        Public Function GetSelector(propertyName As String) As IList Implements ISelector.GetSelector
            Return DirectCast(GetSelectorG(propertyName), IList)
        End Function

        Public Function GetSelectorG(propertyName As String) As IList(Of EventInfo) Implements ISelector(Of EventInfo).GetSelectorG
            Dim toReturn As List(Of EventInfo) = ReflectionHelper.GetMembersDictionary(GetType(TObjectType), True, False).Values.OfType(Of EventInfo)().ToList()
            toReturn.Sort(Function(objMember1, objMember2) String.Compare(objMember1.Name, objMember2.Name, StringComparison.InvariantCultureIgnoreCase))
            Return toReturn
        End Function

        Public Overrides Sub Run(owner As Object, globalVars As IContextLookup)
            Dim candidateEventMember As MemberInfo = ReflectionHelper.GetMember(GetType(TObjectType), EventName, True, True)
            If candidateEventMember IsNot Nothing Then
                Dim candidateEvent As EventInfo = TryCast(candidateEventMember, EventInfo)
                If candidateEvent IsNot Nothing Then
                    Dim target As Object = Me.Instance.Evaluate(owner, globalVars)
                    If target IsNot Nothing Then
                        Dim objDelegate As [Delegate] = Me.DelegateExpression.Evaluate(owner, globalVars)
                        If objDelegate IsNot Nothing Then
                            If Me.LockTarget Then
                                SyncLock target
                                    candidateEvent.AddEventHandler(target, objDelegate)
                                End SyncLock
                            Else
                                candidateEvent.AddEventHandler(target, objDelegate)
                            End If
                        End If
                    End If
                    Exit Sub
                End If
            End If
            Throw New Exception(String.Format("Event {0} was not found in type {1}", Me.EventName, ReflectionHelper.GetSafeTypeName(GetType(TObjectType))))
        End Sub
    End Class
End NameSpace